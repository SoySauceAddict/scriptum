"use server";

import { revalidatePath } from "next/cache";
import { ensureAnonymousUser } from "@/lib/anonymous";

export type AnonState = { error?: string; ok?: boolean } | undefined;

export async function setNicknameAction(_prev: AnonState, formData: FormData): Promise<AnonState> {
  const raw = formData.get("nickname");
  if (typeof raw !== "string") return { error: "Neplatná přezdívka." };
  try {
    await ensureAnonymousUser(raw);
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Nastala chyba." };
  }
}
