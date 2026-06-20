"use client";

import Link from "next/link";
import { useState } from "react";

export function DemoNotice() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <aside className="fixed bottom-4 left-4 max-w-sm rounded-lg border border-slate-200 bg-white p-4 pr-10 text-sm text-slate-600 shadow-sm">
      <button
        type="button"
        aria-label="Dismiss demo notice"
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-3 text-slate-400 transition hover:text-slate-700"
      >
        ×
      </button>
      <p>
        Demo credentials are prefilled for convenience, but authentication is
        fully enabled. The EMR admin area is intentionally available without
        login at{" "}
        <Link href="/admin" className="font-medium text-teal-700 hover:underline">
          /admin
        </Link>
        .
      </p>
      <p className="mt-2">
        More details are available in{" "}
        <a
          href="https://github.com/sagun-karki/Zealthy_EMR_sagun"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-teal-700 hover:underline"
        >
          sagun-karki/Zealthy_EMR_sagun
        </a>
        .
      </p>
    </aside>
  );
}
