"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { LoginSchema, RegisterSchema } from "@/lib/validators";

export type AuthState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "Email už je zaregistrovaný." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  await prisma.activityLog.create({
    data: { action: "USER_REGISTERED", userId: user.id },
  });

  await createSession(user.id, user.role);
  redirect("/");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return { message: "Špatný email nebo heslo." };
  }

  await prisma.activityLog.create({
    data: { action: "USER_LOGIN", userId: user.id },
  });

  await createSession(user.id, user.role);
  redirect("/");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
