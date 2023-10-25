import { Request, Response } from "express";
import { nanoid } from "nanoid";
import {
  ForgotPasswordBody,
  LoginUserBody,
  RegisterUserBody,
  ResetPasswordBody,
  ResetPasswordParams,
  VerifyUserParams,
} from "../validationSchema/user.schema";
import log from "../utils/logger";
import sendEmail from "../utils/mailer";
import UserModel from "../model/user.model";
import { auth } from "../config/lucia";
import passwordResetTokenModel from "../model/passwordResetToken.model";
import { generateRandomString, isWithinExpiration } from "lucia/utils";

export async function register(
  req: Request<{}, {}, RegisterUserBody>,
  res: Response
) {
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
      verified: false,
    },
  });

  await sendEmail({
    to: user.email,
    from: "test@example.com",
    subject: "Verify your email",
    text: `verification code: ${user.verificationToken}`,
  });

  return res.send("User successfully created");
}

export async function verify(req: Request<VerifyUserParams>, res: Response) {
  const { verificationToken } = req.params;

  const user = await UserModel.findOne({ verificationToken });

  if (!user) {
    throw new Error("Code de verification invalide");
  }

  if (user.verified) {
    throw new Error("Utilisateur déjà vérifié");
  }

  user.verified = true;

  await user.save();

  return res.send("Utilisateur vérifié");
}

export async function login(
  req: Request<{}, {}, LoginUserBody>,
  res: Response
) {
  const message = "Invalid email or password";
  const { email, password } = req.body;

  const key = await auth.useKey("email", email.toLowerCase(), password);
  const user = await UserModel.findById(key.userId);

  if (!user) {
    res.status(401);
    throw new Error(message);
  }

  if (!user.verified) {
    res.status(401);
    throw new Error("Please verify your email");
  }

  const session = await auth.createSession({
    userId: key.userId,
    attributes: {},
  });

  const authRequest = auth.handleRequest(req, res);

  authRequest.setSession(session);

  return res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    _id: user._id,
    email: user.email,
  });
}

export async function getProfile(req: Request, res: Response) {
  return res.send(req.user);
}

export async function updateProfile(req: Request, res: Response) {
  const user = await UserModel.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.firstName;

    if (req.body.password) {
      await auth.updateKeyPassword("email", user.email, req.body.password);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
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
    "Si un utilisateur avec cet email est enregistré, vous allez recevoir un email de réinitialisation de mot de passe";

  const { email } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    log.debug(`Utilisateur avec l'email ${email} n'existe pas`);
    throw new Error(message);
  }

  if (!user.verified) {
    throw new Error("Utilisateur non vérifié");
  }

  const passwordResetTokens = await passwordResetTokenModel.find({
    user_id: user._id,
  });

  const EXPIRES_IN = 1000 * 60 * 60 * 2;

  if (passwordResetTokens.length > 0) {
    const reusableStoredToken = passwordResetTokens.find((token) =>
      isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2)
    );
    if (reusableStoredToken) {
      throw new Error("Un email a déjà été envoyé");
    }
  }

  const passwordResetCode = generateRandomString(63);

  await passwordResetTokenModel.create({
    user_id: user._id,
    expires: new Date().getTime() + EXPIRES_IN,
    _id: passwordResetCode,
  });

  await sendEmail({
    to: user.email,
    from: "test@example.com",
    subject: "Réinitialisez votre mot de passe",
    text: `Code de réinitialisation de mot de passe: ${passwordResetCode}`,
  });

  log.debug(`Email de réinitialisation de mot de passe envoyé à ${email}`);

  return res.send(message);
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
    res.status(401);
    throw new Error("Code de réinitialisation invalide");
  }

  await passwordResetTokenModel.deleteOne({
    _id: storedPasswordResetToken._id,
  });

  if (!isWithinExpiration(storedPasswordResetToken.expires)) {
    throw new Error("Code de réinitialisation expiré");
  }

  const user = await UserModel.findById(storedPasswordResetToken._id);

  if (!user) {
    throw new Error("Erreur");
  }

  await auth.updateKeyPassword("email", user.email, password);

  return res.send("Mot de passe de l'utilisateur mis à jour");
}

export async function logout(req: Request, res: Response) {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate(); // or `authRequest.validateBearerToken()`
  if (!session) {
    return res.sendStatus(401);
  }
  await auth.invalidateSession(session.sessionId);

  authRequest.setSession(null);
  return res.status(200).json({ message: "Logged out successfully" });
}
