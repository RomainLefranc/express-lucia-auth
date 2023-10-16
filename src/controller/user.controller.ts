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
import generateToken from "../utils/jwt";

export async function register(
  req: Request<{}, {}, RegisterUserBody>,
  res: Response
) {
  const body = req.body;

  const userExists = await UserModel.findOne({ email: body.email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await UserModel.create(body);

  await sendEmail({
    to: user.email,
    from: "test@example.com",
    subject: "Verify your email",
    text: `verification code: ${user.verificationCode}. Id: ${user._id}`,
  });

  return res.send("User successfully created");
}

export async function verify(req: Request<VerifyUserParams>, res: Response) {
  const { id, verificationCode } = req.params;

  const user = await UserModel.findById(id);

  if (!user) {
    throw new Error("Id ou code de verification invalide");
  }

  if (user.verified) {
    throw new Error("Utilisateur déjà vérifié");
  }

  if (user.verificationCode === verificationCode) {
    user.verified = true;

    await user.save();

    return res.send("Utilisateur vérifié");
  }

  throw new Error("Id ou code de verification invalide");
}

export async function login(
  req: Request<{}, {}, LoginUserBody>,
  res: Response
) {
  const message = "Invalid email or password";
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error(message);
  }

  if (!user.verified) {
    res.status(401);
    throw new Error("Please verify your email");
  }

  const passwordMatch = await user.validatePassword(password);

  if (!passwordMatch) {
    res.status(401);
    throw new Error(message);
  }

  generateToken(res, user._id.toString());

  return res.json({
    firstname: user.firstName,
    lastname: user.lastName,
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
      user.password = req.body.password;
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

  const passwordResetCode = nanoid();

  user.passwordResetCode = passwordResetCode;

  await user.save();

  await sendEmail({
    to: user.email,
    from: "test@example.com",
    subject: "Réinitialisez votre mot de passe",
    text: `Code de réinitialisation de mot de passe: ${passwordResetCode}. Id ${user._id}`,
  });

  log.debug(`Email de réinitialisation de mot de passe envoyé à ${email}`);

  return res.send(message);
}

export async function resetPassword(
  req: Request<ResetPasswordParams, {}, ResetPasswordBody>,
  res: Response
) {
  const { id, passwordResetCode } = req.params;

  const { password } = req.body;

  const user = await UserModel.findById(id);

  if (!user) {
    res.status(401);
    throw new Error("Id ou code de réinitialisation invalide");
  }

  if (!user.passwordResetCode || user.passwordResetCode !== passwordResetCode) {
    res.status(400);
    throw new Error("Code de réinitialisation de mot de passe invalide");
  }

  user.passwordResetCode = null;

  user.password = password;

  await user.save();

  return res.send("Mot de passe de l'utilisateur mis à jour");
}

export function logout(req: Request, res: Response) {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  return res.status(200).json({ message: "Logged out successfully" });
}
