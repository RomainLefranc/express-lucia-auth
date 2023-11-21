import { object, string, TypeOf } from "zod";

export const registerUserDto = object({
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

export const verifyUserDto = object({
  params: object({
    verificationToken: string(),
  }),
});

export const forgotPasswordDto = object({
  body: object({
    email: string({
      required_error: "Email est requis",
    }).email("Email invalide"),
  }),
});

export const resetPasswordDto = object({
  params: object({
    passwordResetToken: string(),
  }),
  body: object({
    password: string({
      required_error: "Mot de passe est requis",
      invalid_type_error: "Mot de passe doit être une chaine de caractères",
    }).min(6, "Mot de passe doit faire minimum 6 caractères"),
  }),
});

export const loginUserDto = object({
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

export type LoginUserBody = TypeOf<typeof loginUserDto>["body"];

export type RegisterUserBody = TypeOf<typeof registerUserDto>["body"];

export type VerifyUserParams = TypeOf<typeof verifyUserDto>["params"];

export type ForgotPasswordBody = TypeOf<typeof forgotPasswordDto>["body"];

export type ResetPasswordBody = TypeOf<typeof resetPasswordDto>["body"];

export type ResetPasswordParams = TypeOf<typeof resetPasswordDto>["params"];
