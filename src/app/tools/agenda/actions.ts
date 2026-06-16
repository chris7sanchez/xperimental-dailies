"use server";

import { revalidatePath } from "next/cache";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createHash } from "crypto";

function keyFor(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}
function hashPin(pin: string) {
  return createHash("sha256").update(`xp-agenda:${pin}`).digest("hex");
}

// Lectura cruda interna (incluye pinHash) — NO se expone al cliente.
async function readRaw(): Promise<any> {
  try {
    const snapshot = await getDoc(doc(db, "agenda", "main"));
    if (!snapshot.exists()) return { participants: {} };
    return snapshot.data();
  } catch (err) {
    console.error("Error fetching agenda:", err);
    return { participants: {} };
  }
}

// Para el cliente: participantes SIN el pinHash (solo si tienen pin o no).
export async function getAgenda() {
  const data = await readRaw();
  const participants: Record<string, any> = {};
  for (const [k, p] of Object.entries(data.participants || {})) {
    const { pinHash, ...rest } = p as any;
    participants[k] = { ...rest, hasPin: !!pinHash };
  }
  return { participants };
}

export async function saveAvailability(name: string, pin: string, slots: string[]) {
  if (!name?.trim()) return { error: "Se requiere un nombre" };
  if (!/^\d{4}$/.test(pin || "")) return { error: "El PIN debe tener 4 cifras" };

  const data = await readRaw();
  if (!data.participants) data.participants = {};
  const key = keyFor(name);
  const existing = data.participants[key];

  if (existing?.pinHash && existing.pinHash !== hashPin(pin)) {
    return { error: "PIN incorrecto para ese nombre" };
  }

  // Si se queda sin horas, eliminamos el participante (no dejamos nombres con 0h).
  if (!slots || slots.length === 0) {
    delete data.participants[key];
  } else {
    data.participants[key] = {
      name: name.trim(),
      slots,
      pinHash: existing?.pinHash || hashPin(pin),
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    await setDoc(doc(db, "agenda", "main"), data);
    revalidatePath("/tools/agenda");
    return { success: true };
  } catch (err) {
    console.error("Error saving agenda:", err);
    return { error: "Error al guardar en la base de datos" };
  }
}

export async function deleteAvailability(name: string, pin: string) {
  if (!name?.trim()) return { error: "Se requiere un nombre" };
  if (!/^\d{4}$/.test(pin || "")) return { error: "El PIN debe tener 4 cifras" };

  const data = await readRaw();
  const key = keyFor(name);
  const existing = data.participants?.[key];
  if (!existing) return { error: "No hay horario guardado con ese nombre" };
  if (existing.pinHash && existing.pinHash !== hashPin(pin)) {
    return { error: "PIN incorrecto para ese nombre" };
  }

  delete data.participants[key];
  try {
    await setDoc(doc(db, "agenda", "main"), data);
    revalidatePath("/tools/agenda");
    return { success: true };
  } catch (err) {
    console.error("Error deleting agenda:", err);
    return { error: "Error al borrar en la base de datos" };
  }
}

export async function verifyPin(name: string, pin: string) {
  if (!name?.trim() || !/^\d{4}$/.test(pin || "")) return { ok: false };
  const data = await readRaw();
  const existing = data.participants?.[keyFor(name)];
  if (!existing) return { ok: false, notFound: true };
  if (!existing.pinHash) return { ok: true };
  return { ok: existing.pinHash === hashPin(pin) };
}
