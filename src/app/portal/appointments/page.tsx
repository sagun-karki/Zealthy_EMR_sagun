import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function AppointmentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = Number.parseInt(session.user.id, 10);

  if (Number.isNaN(userId)) {
    redirect("/login");
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      userId,
      datetime: { gte: new Date() },
      endedAt: null,
    },
    orderBy: { datetime: "asc" },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <Link
            href="/"
            className="text-sm font-medium text-teal-700 hover:underline"
          >
            &larr; Back to summary
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-slate-950">
            Upcoming Appointments
          </h1>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {appointments.length === 0 ? (
            <p className="text-slate-500">No upcoming appointments.</p>
          ) : (
            <ul className="space-y-4">
              {appointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="border-b border-slate-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className="font-medium text-slate-900">
                    {appointment.provider}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {appointment.datetime.toLocaleString()}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {appointment.repeat
                      ? `Repeats ${appointment.repeat}`
                      : "Does not repeat"}
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
