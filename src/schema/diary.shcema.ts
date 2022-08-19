import { object, string, TypeOf } from "zod";

export const createDiarySchema = object({
  body: object({
    title: string({
      required_error: "Başlık girilmesi zorunludur",
    }),
    body: string({
      required_error: "Günlük içeriği girilmesi zorunludur",
    }),
  }),
});

export const deleteDiarySchema = object({
  params: object({
    id: string(),
  }),
});

export const updateDiarySchema = object({
  body: object({
    title: string(),
    body: string(),
  }),
  params: object({
    id: string(),
  }),
});

export type CreateDiaryInput = TypeOf<typeof createDiarySchema>["body"];
export type DeleteDiaryInput = TypeOf<typeof deleteDiarySchema>["params"];
export type UpdateDiaryInput = TypeOf<typeof updateDiarySchema>;
