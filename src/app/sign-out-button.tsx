"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <button
      type="button"
      disabled={isSigningOut}
      onClick={() => {
        setIsSigningOut(true);
        void signOut({ callbackUrl: "/" });
      }}
      className="shrink-0 text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
    >
      {isSigningOut ? "Signing out..." : "Sign Out"}
    </button>
  );
}
