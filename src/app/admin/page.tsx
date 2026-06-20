import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function AdminPage() {
  await connection();

  const now = new Date();

  const patients = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: {
      appointments: {
        where: {
          OR: [
            { datetime: { gte: now }, repeat: null },
            {
              repeat: { not: null },
              OR: [{ endedAt: null }, { endedAt: { gte: now } }],
            },
          ],
        },
        orderBy: { datetime: "asc" },
      },
      prescriptions: {
        orderBy: { refillOn: "asc" },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-teal-700">Mini EMR</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              Patients
            </h1>
            <p className="mt-2 text-slate-600">
              Manage patient records, appointments, and prescriptions.
            </p>
          </div>
          <Link
            href="/admin/patients/new"
            className="shrink-0 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            New Patient
          </Link>
        </header>

        <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[64rem] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Patient</th>
                <th className="px-4 py-3 font-semibold">Upcoming Appts</th>
                <th className="px-4 py-3 font-semibold">Next Appointment</th>
                <th className="px-4 py-3 font-semibold">Prescriptions</th>
                <th className="px-4 py-3 font-semibold">Next Refill</th>
                <th className="px-4 py-3 font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {patients.map((patient) => {
                const nextAppointment = patient.appointments[0];
                const nextRefill = patient.prescriptions.find(
                  (rx) => rx.refillOn >= now,
                );

                return (
                  <tr key={patient.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-950">
                        {patient.name}
                      </div>
                      <div className="mt-1 text-slate-600">
                        {patient.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {patient.appointments.length}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {nextAppointment ? (
                        <div>
                          <div>{nextAppointment.provider}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {nextAppointment.datetime.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">None scheduled</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {patient.prescriptions.length}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {nextRefill ? (
                        <div>
                          <div>
                            {nextRefill.medication} - {nextRefill.dosage}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {nextRefill.refillOn.toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">None upcoming</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/patients/${patient.id}`}
                        className="font-medium text-teal-700 hover:underline"
                      >
                        View More
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {patients.length === 0 ? (
            <div className="border-t border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
              No patients found.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
