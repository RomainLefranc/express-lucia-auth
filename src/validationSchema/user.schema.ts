import { object, string, TypeOf } from "zod";

export const registerUserSchema = object({
  body: object({
    firstName: string({
      required_error: "Prenom est requis",
    }),
    lastName: string({
      required_error: "Nom est requis",
    }),
    password: string({
      required_error: "Mot de passe est requis",
    }).min(6, "Mot de passe doit faire minimum 6 caractères"),
    email: string({
      required_error: "Email est requis",
    }).email("Email invalide"),
  }),
});

export const verifyUserSchema = object({
  params: object({
    id: string(),
    verificationCode: string(),
  }),
});

export const forgotPasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email est requis",
    }).email("Email invalide"),
  }),
});

export const resetPasswordSchema = object({
  params: object({
    id: string(),
    passwordResetCode: string(),
  }),
  body: object({
    password: string({
      required_error: "Mot de passe est requis",
      invalid_type_error: "Mot de passe doit être une chaine de caractères",
    }).min(6, "Mot de passe doit faire minimum 6 caractères"),
    passwordConfirmation: string({
      invalid_type_error:
        "Mot de passe de confirmation doit être une chaine de caractères",
      required_error: "Confirmation de mot de passe est requis",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirmation"],
  }),
});

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: "Email est requis",
      invalid_type_error: "Email doit être une chaine de caractères",
    }).email("Email invalide"),
    password: string({
      required_error: "Mot de passe est requis",
      invalid_type_error: "Mot de passe doit être une chaine de caractères",
    }).min(6, "Mot de passe doit faire au minimum 6 caractères"),
  }),
});

export type LoginUserBody = TypeOf<typeof loginUserSchema>["body"];

export type RegisterUserBody = TypeOf<typeof registerUserSchema>["body"];

export type VerifyUserParams = TypeOf<typeof verifyUserSchema>["params"];

export type ForgotPasswordBody = TypeOf<typeof forgotPasswordSchema>["body"];

export type ResetPasswordBody = TypeOf<typeof resetPasswordSchema>["body"];

export type ResetPasswordParams = TypeOf<typeof resetPasswordSchema>["params"];
