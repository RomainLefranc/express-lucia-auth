import { Request, Response } from "express";
import { nanoid } from "nanoid";
import {
  ForgotPasswordBody,
  LoginUserBody,
  RegisterUserBody,
  ResetPasswordBody,
  ResetPasswordParams,
  VerifyUserParams,
} from "@validationSchema/user.schema";
import { log, auth } from "@config/index";
import { sendEmail } from "@utils/index";
import { userModel } from "@model/index";
import passwordResetTokenModel from "@model/passwordResetToken.model";
import { generateRandomString, isWithinExpiration } from "lucia/utils";
import { LuciaError } from "lucia";

export async function register(
  req: Request<{}, {}, RegisterUserBody>,
  res: Response
) {
  const body = req.body;

  const { email, firstName, lastName, password } = body;
  let user;

  try {
    user = await auth.createUser({
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
  } catch (error) {
    res.status(500);
    if (
      error instanceof LuciaError &&
      error.message == "AUTH_DUPLICATE_KEY_ID"
    ) {
      throw new Error("Account already exist");
    }
    throw error;
  }

  await sendEmail({
    to: user.email,
    from: "test@example.com",
    subject: "Verify your email",
    text: `verification token: ${user.verificationToken}`,
  });

  return res.status(201).json({
    message: "User created",
  });
}

export async function verify(req: Request<VerifyUserParams>, res: Response) {
  const { verificationToken } = req.params;

  const user = await userModel.findOne({ verificationToken });

  if (!user) {
    res.status(400);
    throw new Error("Verification token invalid");
  }

  if (user.emailIsVerified) {
    res.status(400);
    throw new Error("User already verified");
  }

  user.emailIsVerified = true;

  await user.save();

  return res.status(200).json({
    message: "User verified",
  });
}

export async function login(
  req: Request<{}, {}, LoginUserBody>,
  res: Response
) {
  const message = "Invalid email or password";
  const { email, password } = req.body;
  let key;

  try {
    key = await auth.useKey("email", email.toLowerCase(), password);
  } catch (error) {
    res.status(500);

    if (
      error instanceof LuciaError &&
      (error.message === "AUTH_INVALID_KEY_ID" ||
        error.message === "AUTH_INVALID_PASSWORD")
    ) {
      throw new Error(message);
    }
    throw error;
  }

  const user = await userModel.findById(key.userId);

  if (!user) {
    res.status(401);
    throw new Error(message);
  }

  if (!user.emailIsVerified) {
    res.status(401);
    throw new Error("Please verify your email");
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
}

export async function getProfile(req: Request, res: Response) {
  return res.status(200).json({
    data: req.user,
  });
}

export async function updateProfile(req: Request, res: Response) {
  const user = await userModel.findById(req.user.userId);

  if (user) {
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
  } else {
    res.status(404);
    throw new Error("User not found");
  }
}

export async function forgotPassword(
  req: Request<{}, {}, ForgotPasswordBody>,
  res: Response
) {
  const message =
    "If a user with this email is registered, you will receive a password recovery email";

  const { email } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    res.status(200);
    throw new Error(message);
  }

  if (!user.emailIsVerified) {
    res.status(401);
    throw new Error("User not verified");
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
      throw new Error("Un email a déjà été envoyé");
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
}

export async function resetPassword(
  req: Request<ResetPasswordParams, {}, ResetPasswordBody>,
  res: Response
) {
  const { passwordResetToken } = req.params;
  const { password } = req.body;

  const storedPasswordResetToken = await passwordResetTokenModel.findById(
    passwordResetToken
  );

  if (!storedPasswordResetToken) {
    res.status(500);
    throw new Error("Reset password token invalid");
  }

  await passwordResetTokenModel.findByIdAndDelete({
    _id: storedPasswordResetToken._id,
  });

  if (!isWithinExpiration(storedPasswordResetToken.expires)) {
    res.status(500);
    throw new Error("Reset password token expired");
  }

  const user = await userModel.findById(storedPasswordResetToken.user_id);

  if (!user) {
    res.status(500);
    throw new Error("Something went wrong");
  }

  await auth.updateKeyPassword("email", user.email, password);

  res.status(200);
  return res.json({ message: "Password updated" });
}

export async function logout(req: Request, res: Response) {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();
  if (!session) {
    res.status(401);
    throw new Error("Not authenticated");
  }
  await auth.invalidateSession(session.sessionId);

  authRequest.setSession(null);
  return res.status(200).json({ message: "Logged out successfully" });
}
