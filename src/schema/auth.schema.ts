import { object, string, TypeOf } from "zod";

export const createSessionSchema = object({
  body: object({
    email: string({ required_error: "Email girilmesi zorunludur." }).email(
      "Geçersiz şifre veya email girdiniz"
    ),
    password: string({ required_error: "Şifre girilmesi zorunludur." }).min(
      6,
      "Geçersiz şifre veya email girdiniz"
    ),
  }),
});

export type CreateSessionInput = TypeOf<typeof createSessionSchema>["body"];
