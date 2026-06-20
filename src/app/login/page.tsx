import { Suspense } from "react";
import { LoginForm } from "../login-form";

export default function LoginPage() {
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
    </main>
  );
}
