import Link from "next/link";
import { Suspense } from "react";
import { DemoNotice } from "./demo-notice";
import { LoginForm } from "./login-form";
import { SignOutButton } from "./sign-out-button";
import { expandAppointmentOccurrences } from "@/lib/appointments";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    return <LoggedOutHome />;
  }

  const userId = Number.parseInt(session.user.id, 10);

  if (Number.isNaN(userId)) {
    return <LoggedOutHome />;
  }

  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [upcomingAppointments, upcomingRefills, user] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        userId,
        endedAt: null,
      },
      orderBy: { datetime: "asc" },
    }),
    prisma.prescription.findMany({
      where: {
        userId,
        refillOn: { gte: now, lte: sevenDaysLater },
      },
      orderBy: { refillOn: "asc" },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);
  const appointmentOccurrences = expandAppointmentOccurrences(
    upcomingAppointments,
    now,
    sevenDaysLater,
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-teal-700">
              Zealthy “mini” EMR
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              Welcome, {user?.name}
            </h1>
            <p className="mt-1 text-slate-600">{user?.email}</p>
          </div>
          <SignOutButton />
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950">
              Upcoming Appointments
            </h2>
            <Link
              href="/portal/appointments"
              className="shrink-0 text-sm font-medium text-teal-700 hover:underline"
            >
              View all
            </Link>
          </div>
          {appointmentOccurrences.length === 0 ? (
            <p className="text-slate-500">
              No appointments in the next 7 days.
            </p>
          ) : (
            <ul className="space-y-3">
              {appointmentOccurrences.map((appointment) => (
                <li
                  key={appointment.key}
                  className="border-b border-slate-200 pb-3 last:border-0 last:pb-0"
                >
                  <div className="font-medium text-slate-900">
                    {appointment.provider}
                  </div>
                  <div className="text-sm text-slate-600">
                    {appointment.datetime.toLocaleString()}
                    {appointment.repeat ? ` - ${appointment.repeat}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950">
              Medication Refills
            </h2>
            <Link
              href="/portal/prescriptions"
              className="shrink-0 text-sm font-medium text-teal-700 hover:underline"
            >
              View all
            </Link>
          </div>
          {upcomingRefills.length === 0 ? (
            <p className="text-slate-500">No refills due in the next 7 days.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingRefills.map((prescription) => (
                <li
                  key={prescription.id}
                  className="border-b border-slate-200 pb-3 last:border-0 last:pb-0"
                >
                  <div className="font-medium text-slate-900">
                    {prescription.medication} - {prescription.dosage}
                  </div>
                  <div className="text-sm text-slate-600">
                    Qty: {prescription.quantity} - Refill due{" "}
                    {prescription.refillOn.toLocaleDateString()} (
                    {prescription.refillSchedule})
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function LoggedOutHome() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-sm">
        <div className="mb-8">
          <p className="text-sm font-medium text-teal-700">
            Zealthy “mini” EMR
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Sign in
          </h1>
        </div>

        <Suspense
          fallback={
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              Loading sign in...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </section>

      <DemoNotice />
    </main>
  );
}
