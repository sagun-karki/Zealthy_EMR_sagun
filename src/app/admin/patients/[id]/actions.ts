"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createAppointment(formData: FormData) {
  const userId = Number(getString(formData, "userId"));
  const provider = getString(formData, "provider");
  const datetime = getString(formData, "datetime");
  const repeat = getString(formData, "repeat");
  const recurrenceEndsOn = getString(formData, "recurrenceEndsOn");

  if (!userId || !provider || !datetime) {
    return;
  }

  await prisma.appointment.create({
    data: {
      userId,
      provider,
      datetime: new Date(datetime),
      repeat: repeat || null,
      endedAt: repeat && recurrenceEndsOn ? new Date(recurrenceEndsOn) : null,
    },
  });

  revalidatePath(`/admin/patients/${userId}`);
}

export async function updatePatient(formData: FormData) {
  const userId = Number(getString(formData, "userId"));
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!userId || !name || !email) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email: email.toLowerCase(),
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/patients/${userId}`);
}

export async function updateAppointment(formData: FormData) {
  const id = Number(getString(formData, "appointmentId"));
  const userId = Number(getString(formData, "userId"));
  const provider = getString(formData, "provider");
  const datetime = getString(formData, "datetime");
  const repeat = getString(formData, "repeat");
  const recurrenceEndsOn = getString(formData, "recurrenceEndsOn");

  if (!id || !userId || !provider || !datetime) {
    return;
  }

  await prisma.appointment.update({
    where: { id },
    data: {
      provider,
      datetime: new Date(datetime),
      repeat: repeat || null,
      endedAt: repeat && recurrenceEndsOn ? new Date(recurrenceEndsOn) : null,
    },
  });

  revalidatePath(`/admin/patients/${userId}`);
}

export async function deleteAppointment(formData: FormData) {
  const id = Number(getString(formData, "appointmentId"));
  const userId = Number(getString(formData, "userId"));

  if (!id || !userId) {
    return;
  }

  await prisma.appointment.delete({ where: { id } });
  revalidatePath(`/admin/patients/${userId}`);
}

export async function endRecurringAppointment(formData: FormData) {
  const id = Number(getString(formData, "appointmentId"));
  const userId = Number(getString(formData, "userId"));

  if (!id || !userId) {
    return;
  }

  await prisma.appointment.update({
    where: { id },
    data: { endedAt: new Date() },
  });

  revalidatePath(`/admin/patients/${userId}`);
}

export async function createPrescription(formData: FormData) {
  const userId = Number(getString(formData, "userId"));
  const medication = getString(formData, "medication");
  const dosage = getString(formData, "dosage");
  const quantity = Number(getString(formData, "quantity"));
  const refillOn = getString(formData, "refillOn");
  const refillSchedule = getString(formData, "refillSchedule");

  if (!userId || !medication || !dosage || !quantity || !refillOn || !refillSchedule) {
    return;
  }

  await prisma.prescription.create({
    data: {
      userId,
      medication,
      dosage,
      quantity,
      refillOn: new Date(refillOn),
      refillSchedule,
    },
  });

  revalidatePath(`/admin/patients/${userId}`);
}

export async function updatePrescription(formData: FormData) {
  const id = Number(getString(formData, "prescriptionId"));
  const userId = Number(getString(formData, "userId"));
  const medication = getString(formData, "medication");
  const dosage = getString(formData, "dosage");
  const quantity = Number(getString(formData, "quantity"));
  const refillOn = getString(formData, "refillOn");
  const refillSchedule = getString(formData, "refillSchedule");

  if (!id || !userId || !medication || !dosage || !quantity || !refillOn || !refillSchedule) {
    return;
  }

  await prisma.prescription.update({
    where: { id },
    data: {
      medication,
      dosage,
      quantity,
      refillOn: new Date(refillOn),
      refillSchedule,
    },
  });

  revalidatePath(`/admin/patients/${userId}`);
}

export async function deletePrescription(formData: FormData) {
  const id = Number(getString(formData, "prescriptionId"));
  const userId = Number(getString(formData, "userId"));

  if (!id || !userId) {
    return;
  }

  await prisma.prescription.delete({ where: { id } });
  revalidatePath(`/admin/patients/${userId}`);
}
