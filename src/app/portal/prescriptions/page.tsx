import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function PrescriptionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = Number.parseInt(session.user.id, 10);

  if (Number.isNaN(userId)) {
    redirect("/login");
  }

  const prescriptions = await prisma.prescription.findMany({
    where: { userId },
    orderBy: { refillOn: "asc" },
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
            Prescriptions
          </h1>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {prescriptions.length === 0 ? (
            <p className="text-slate-500">No prescriptions found.</p>
          ) : (
            <ul className="space-y-4">
              {prescriptions.map((prescription) => (
                <li
                  key={prescription.id}
                  className="border-b border-slate-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className="font-medium text-slate-900">
                    {prescription.medication} - {prescription.dosage}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Quantity: {prescription.quantity}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Refill due {prescription.refillOn.toLocaleDateString()} (
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
