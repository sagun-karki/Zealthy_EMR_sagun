import { notFound } from "next/navigation";
import { PatientDetail } from "./patient-detail";
import { prisma } from "@/lib/prisma";
import {
  createAppointment,
  updatePatient,
  updateAppointment,
  deleteAppointment,
  endRecurringAppointment,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from "./actions";

export const runtime = "nodejs";

function formatDateTimeInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function parseDosageAmount(dosage: string) {
  return Number.parseFloat(dosage);
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
