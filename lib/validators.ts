import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Jméno musí mít aspoň 2 znaky").max(50).trim(),
  email: z.email("Neplatný email").trim(),
  password: z.string().min(8, "Heslo musí mít aspoň 8 znaků"),
});

export const LoginSchema = z.object({
  email: z.email("Neplatný email").trim(),
  password: z.string().min(1, "Zadej heslo"),
});

export const PostSchema = z.object({
  title: z.string().min(3, "Titulek musí mít aspoň 3 znaky").max(200).trim(),
  content: z.string().min(1, "Obsah nesmí být prázdný").max(10000).trim(),
});

export const PostUpdateSchema = PostSchema.partial();

export const CommentSchema = z.object({
  content: z.string().min(1, "Komentář nesmí být prázdný").max(2000).trim(),
  parentId: z.string().nullable().optional(),
});

export const CommentUpdateSchema = z.object({
  content: z.string().min(1, "Komentář nesmí být prázdný").max(2000).trim(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type PostInput = z.infer<typeof PostSchema>;
