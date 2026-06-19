import bcrypt from "bcryptjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function createPatient(formData: FormData) {
  "use server";

  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    redirect("/admin/patients/new?error=missing-fields");
  }

  try {
    const patient = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: await bcrypt.hash(password, 10),
      },
    });

    redirect(`/admin/patients/${patient.id}`);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect("/admin/patients/new?error=email-exists");
    }

    throw error;
  }
}

export default async function NewPatientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-xl space-y-8">
        <header>
          <Link
            href="/admin"
            className="text-sm font-medium text-teal-700 hover:underline"
          >
            &larr; Back to Patients
          </Link>
          <p className="mt-6 text-sm font-medium text-teal-700">Mini EMR</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            New Patient
          </h1>
          <p className="mt-2 text-slate-600">
            Create a patient account for the portal.
          </p>
        </header>

        <form
          action={createPatient}
          className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error === "missing-fields" ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              Name, email, and password are required.
            </p>
          ) : null}
          {error === "email-exists" ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              A patient with that email already exists.
            </p>
          ) : null}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Create Patient
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
