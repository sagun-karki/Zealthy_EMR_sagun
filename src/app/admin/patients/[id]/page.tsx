import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { PatientDetail } from "./patient-detail";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formatDateTimeInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function parseDosageAmount(dosage: string) {
  return Number.parseFloat(dosage);
}

async function createAppointment(formData: FormData) {
  "use server";

  const userId = Number(getString(formData, "userId"));
  const provider = getString(formData, "provider");
  const datetime = getString(formData, "datetime");
  const repeat = getString(formData, "repeat");

  if (!userId || !provider || !datetime) {
    return;
  }

  await prisma.appointment.create({
    data: {
      userId,
      provider,
      datetime: new Date(datetime),
      repeat: repeat || null,
    },
  });

  revalidatePath(`/admin/patients/${userId}`);
}

async function updatePatient(formData: FormData) {
  "use server";

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

async function updateAppointment(formData: FormData) {
  "use server";

  const id = Number(getString(formData, "appointmentId"));
  const userId = Number(getString(formData, "userId"));
  const provider = getString(formData, "provider");
  const datetime = getString(formData, "datetime");
  const repeat = getString(formData, "repeat");

  if (!id || !userId || !provider || !datetime) {
    return;
  }

  await prisma.appointment.update({
    where: { id },
    data: {
      provider,
      datetime: new Date(datetime),
      repeat: repeat || null,
    },
  });

  revalidatePath(`/admin/patients/${userId}`);
}

async function deleteAppointment(formData: FormData) {
  "use server";

  const id = Number(getString(formData, "appointmentId"));
  const userId = Number(getString(formData, "userId"));

  if (!id || !userId) {
    return;
  }

  await prisma.appointment.delete({ where: { id } });
  revalidatePath(`/admin/patients/${userId}`);
}

async function endRecurringAppointment(formData: FormData) {
  "use server";

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

async function createPrescription(formData: FormData) {
  "use server";

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

async function updatePrescription(formData: FormData) {
  "use server";

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

async function deletePrescription(formData: FormData) {
  "use server";

  const id = Number(getString(formData, "prescriptionId"));
  const userId = Number(getString(formData, "userId"));

  if (!id || !userId) {
    return;
  }

  await prisma.prescription.delete({ where: { id } });
  revalidatePath(`/admin/patients/${userId}`);
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patientId = parseInt(id, 10);
  if (isNaN(patientId)) {
    notFound();
  }

  const now = new Date();

  const [patient, medications, dosages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: patientId },
      include: {
        appointments: {
          where: {
            datetime: { gte: now },
            endedAt: null,
          },
          orderBy: { datetime: "asc" },
        },
        prescriptions: {
          orderBy: { refillOn: "asc" },
        },
      },
    }),
    prisma.medication.findMany({ orderBy: { name: "asc" } }),
    prisma.dosage.findMany(),
  ]);

  if (!patient) {
    notFound();
  }

  const sortedDosages = dosages.toSorted(
    (a, b) => parseDosageAmount(a.name) - parseDosageAmount(b.name),
  );

  return (
    <PatientDetail
      patient={{
        id: patient.id,
        name: patient.name,
        email: patient.email,
        appointments: patient.appointments.map((appt) => ({
          id: appt.id,
          provider: appt.provider,
          datetimeDisplay: appt.datetime.toLocaleString(),
          datetimeInput: formatDateTimeInput(appt.datetime),
          repeat: appt.repeat,
        })),
        prescriptions: patient.prescriptions.map((rx) => ({
          id: rx.id,
          medication: rx.medication,
          dosage: rx.dosage,
          quantity: rx.quantity,
          refillOnDisplay: rx.refillOn.toLocaleDateString(),
          refillOnInput: rx.refillOn.toISOString().slice(0, 10),
          refillSchedule: rx.refillSchedule,
        })),
      }}
      medications={medications}
      dosages={sortedDosages}
      actions={{
        createAppointment,
        updatePatient,
        updateAppointment,
        deleteAppointment,
        endRecurringAppointment,
        createPrescription,
        updatePrescription,
        deletePrescription,
      }}
    />
  );
}
