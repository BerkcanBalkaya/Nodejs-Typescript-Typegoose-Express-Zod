import { object, string, TypeOf, z } from "zod";

export const createUserSchema = object({
  body: object({
    firstName: string({
      required_error: "İsim girilmesi zorunludur",
    }),
    lastName: string({
      required_error: "Soyad girilmesi zorunludur",
    }),
    password: string({
      required_error: "Şifre girilmesi zorunludur",
    }).min(6, "Şifreniz çok kısa. Minimum 6 karakter olmalı"),
    passwordConfirmation: string({
      required_error: "Şifre doğrulaması girilmesi zorunludur",
    }),
    email: string({
      required_error: "Email girilmesi zorunludur",
    }).email("Geçerli bir e posta adresi girmediniz."),
    // * Kontrolü burada yapmak hatalı gibi geliyor. model kısmında pre içinde minik bir kontrol var ama moderator kısmını ne yapsak acaba
    // role: z.enum(["Admin", "Moderator", "User"], {
    //   invalid_type_error: "Belirtilen değerlerden birini girmediniz"
    // }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Şifre eşleşmedi",
    path: ["passwordConfirmation"],
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
      required_error: "Email girilmesi zorunludur",
    }).email("Geçerli bir email adresi değil"),
  }),
});

export const resetPasswordSchema = object({
  params: object({
    id: string(),
    passwordResetCode: string(),
  }),
  body: object({
    password: string({
      required_error: "Şifre girilmesi zorunludur",
    }).min(6, "Şifreniz çok kısa. Minimum 6 karakter olmalı"),
    passwordConfirmation: string({
      required_error: "Şifre doğrulaması girilmesi zorunludur",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Şifre eşleşmedi",
    path: ["passwordConfirmation"],
  }),
});

export const assignRoleSchema = object({
  params: object({
    id: string(),
  }),
  body: object({
    role: z.enum(["Admin", "Moderator", "User"], {
      invalid_type_error:
        "Önceden belirlenmiş rollerden(Admin, Moderator, User) birini girmediniz",
    }),
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
export type VerifyUserInput = TypeOf<typeof verifyUserSchema>["params"];
export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;
export type AssignRoleInput = TypeOf<typeof assignRoleSchema>;
