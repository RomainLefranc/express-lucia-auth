import { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";
import {
  ForgotPasswordBody,
  LoginUserBody,
  RegisterUserBody,
  ResetPasswordBody,
  ResetPasswordParams,
  VerifyUserParams,
} from "dtos/user.dto";
import { log, auth } from "@config/index";
import { sendEmail } from "@utils/index";
import { userModel } from "@model/index";
import passwordResetTokenModel from "@model/passwordResetToken.model";
import { generateRandomString, isWithinExpiration } from "lucia/utils";
import { LuciaError } from "lucia";
import { HttpException } from "exceptions/HttpException";

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

export async function getProfile(req: Request, res: Response) {
  return res.status(200).json({
    data: req.user,
  });
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
  } catch (error) {
    next(error);
  }
  const user = await userModel.findById(req.user.userId);

  if (!user) {
    throw new HttpException(404, "User not found");
  }

  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.firstName;

  if (req.body.password) {
    await auth.updateKeyPassword("email", user.email, req.body.password);
  }

  const updatedUser = await user.save();

  res.json({
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
  });
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
