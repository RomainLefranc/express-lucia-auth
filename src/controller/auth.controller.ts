import { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";
import {
  ForgotPasswordBody,
  LoginUserBody,
  RegisterUserBody,
  ResetPasswordBody,
  ResetPasswordParams,
  VerifyUserParams,
} from "@dtos/user.dto.js";
import { auth, githubAuth } from "@config/index.config.js";
import { sendEmail } from "@utils/index.utils.js";
import { userModel, passwordResetTokenModel } from "@model/index.model.js";
import {
  generateRandomString,
  isWithinExpiration,
  parseCookie,
} from "lucia/utils";
import { HttpException } from "@exceptions/HttpException.js";
import { env } from "@config/env.config.js";

export async function register(
  req: Request<{}, {}, RegisterUserBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const body = req.body;

    const { email, firstName, lastName, password } = body;
    const user = await auth.createUser({
      key: {
        providerId: "email",
        providerUserId: email.toLowerCase(),
        password,
      },
      attributes: {
        email,
        firstName,
        lastName,
        verificationToken: nanoid(),
        emailIsVerified: false,
      },
    });

    await sendEmail({
      to: user.email,
      from: "test@example.com",
      subject: "Verify your email",
      text: `verification token: ${user.verificationToken}`,
    });

    return res.status(201).json({
      message: "User created",
    });
  } catch (error) {
    next(error);
  }
}

export async function verify(
  req: Request<VerifyUserParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const { verificationToken } = req.params;

    const user = await userModel.findOne({ verificationToken });

    if (!user) {
      throw new HttpException(400, "Verification token invalid");
    }

    if (user.emailIsVerified) {
      throw new HttpException(400, "User already verified");
    }

    user.emailIsVerified = true;
    user.verificationToken = null;
    await user.save();

    return res.status(200).json({
      message: "User verified",
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request<{}, {}, LoginUserBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const message = "Invalid email or password";
    const { email, password } = req.body;
    let key;

    key = await auth.useKey("email", email.toLowerCase(), password);

    const user = await userModel.findById(key.userId);

    if (!user) {
      throw new HttpException(401, message);
    }

    if (!user.emailIsVerified) {
      throw new HttpException(401, "Please verify your email");
    }

    const session = await auth.createSession({
      userId: key.userId,
      attributes: { email: user.email, id: user._id },
    });

    const authRequest = auth.handleRequest(req, res);

    authRequest.setSession(session);

    return res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(
  req: Request<{}, {}, ForgotPasswordBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const message =
      "If a user with this email is registered, you will receive a password recovery email";

    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      throw new HttpException(200, message);
    }

    if (!user.emailIsVerified) {
      throw new HttpException(401, "User not verified");
    }

    const storedPasswordResetTokens = await passwordResetTokenModel.find({
      user_id: user._id,
    });

    const EXPIRES_IN = 1000 * 60 * 60 * 2;

    if (storedPasswordResetTokens.length > 0) {
      const reusableStoredToken = storedPasswordResetTokens.find((token) =>
        isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2)
      );
      if (reusableStoredToken) {
        throw new HttpException(401, "Un email a déjà été envoyé");
      }
    }

    const passwordResetToken = generateRandomString(63);

    await passwordResetTokenModel.create({
      user_id: user._id,
      expires: new Date().getTime() + EXPIRES_IN,
      _id: passwordResetToken,
    });

    await sendEmail({
      to: user.email,
      from: "test@example.com",
      subject: "Réinitialisez votre mot de passe",
      text: `Code de réinitialisation de mot de passe: ${passwordResetToken}`,
    });

    res.status(200);
    return res.json({ message });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(
  req: Request<ResetPasswordParams, {}, ResetPasswordBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { passwordResetToken } = req.params;
    const { password } = req.body;

    const storedPasswordResetToken = await passwordResetTokenModel.findById(
      passwordResetToken
    );

    if (!storedPasswordResetToken) {
      throw new HttpException(500, "Reset password token invalid");
    }

    await passwordResetTokenModel.findByIdAndDelete({
      _id: storedPasswordResetToken._id,
    });

    if (!isWithinExpiration(storedPasswordResetToken.expires)) {
      throw new HttpException(500, "Reset password token expired");
    }

    const user = await userModel.findById(storedPasswordResetToken.user_id);

    if (!user) {
      throw new HttpException(500, "Something went wrong");
    }

    await auth.updateKeyPassword("email", user.email, password);

    res.status(200);
    return res.json({ message: "Password updated" });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const authRequest = auth.handleRequest(req, res);
    const session = await authRequest.validate();
    if (!session) {
      throw new HttpException(401, "Not authenticated");
    }
    await auth.invalidateSession(session.sessionId);

    authRequest.setSession(null);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

export async function githubLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const [url, state] = await githubAuth.getAuthorizationUrl();

    res.cookie("github_oauth_state", state, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    return res.status(200);
  } catch (error) {
    next(error);
  }
}

export async function githubCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cookies = parseCookie(req.headers.cookie ?? "");
    const storedState = cookies.github_oauth_state;
    const state = req.query.state;
    const code = req.query.code;

    if (
      !storedState ||
      !state ||
      storedState !== state ||
      typeof code !== "string"
    ) {
      return res.sendStatus(400);
    }

    const { getExistingUser, githubUser, createUser } =
      await githubAuth.validateCallback(code);

    const getUser = async () => {
      const existingUser = await getExistingUser();
      if (existingUser) return existingUser;
      const user = await createUser({
        attributes: {
          email: githubUser.email!,
          emailIsVerified: true,
          firstName: null,
          lastName: null,
          verificationToken: null,
        },
      });
      return user;
    };

    const user = await getUser();
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(req, res);
    authRequest.setSession(session);
  } catch (error) {
    next(error);
  }
}
