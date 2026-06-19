import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = Number.parseInt(session.user.id, 10);

  if (Number.isNaN(userId)) {
    redirect("/login");
  }

  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [upcomingAppointments, upcomingRefills, user] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        userId,
        datetime: { gte: now, lte: sevenDaysLater },
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

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-teal-700">Zealthy</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              Welcome, {user?.name}
            </h1>
            <p className="mt-1 text-slate-600">{user?.email}</p>
          </div>
          <SignOutButton />
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-950">
            Upcoming Appointments
          </h2>
          {upcomingAppointments.length === 0 ? (
            <p className="text-slate-500">
              No appointments in the next 7 days.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <li
                  key={appointment.id}
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
          <h2 className="mb-4 text-xl font-semibold text-slate-950">
            Medication Refills
          </h2>
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
