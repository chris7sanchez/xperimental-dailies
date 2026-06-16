"use server";

import { revalidatePath } from "next/cache";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getAgenda() {
  try {
    const docRef = doc(db, 'agenda', 'main');
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return { participants: {} };
    
    return snapshot.data();
  } catch (err) {
    console.error("Error fetching agenda:", err);
    return { participants: {} };
  }
}

export async function saveAvailability(name: string, slots: string[]) {
  if (!name) throw new Error("Se requiere un nombre");

  const data = await getAgenda() as any;
  const key = name.toLowerCase().trim().replace(/\s+/g, '-');

  if (!data.participants) data.participants = {};

  data.participants[key] = {
    name: name.trim(),
    slots,
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, 'agenda', 'main');
    await setDoc(docRef, data);
    revalidatePath('/tools/agenda');
    return { success: true, participant: data.participants[key] };
  } catch (err) {
    console.error("Error saving agenda:", err);
    throw new Error("Error al guardar en la base de datos");
  }
}
