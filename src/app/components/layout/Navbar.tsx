"use client";

import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useSession, signOut } from "@/lib/auth-client";

export function Navbar() {
  const { openModal } = useAuth();
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const isLoggedIn = !!session?.user;

  return (
    <nav className="flex w-full items-center justify-end gap-4 border-b-2 border-neutral-500 bg-neutral-700 px-4 py-2 z-10">
      <button>
        <Image src="/icons/mail.svg" alt="mail" width={33} height={25} />
      </button>

      <button className="flex items-center gap-2 rounded-lg border-2 border-neutral-500 px-2 py-1.5">
        <Image
          src="/icons/lang-cs.png"
          alt="lang-switch"
          width={24}
          height={24}
        />
        <span className="text-gray-100">CS &gt;</span>
      </button>

      {isLoggedIn && (
        <button className="flex items-center gap-2 rounded-lg border-2 border-neutral-500 px-2.5 py-1.5">
          <PlusIcon size={20} />
          New post
        </button>
      )}

      <button>
        <Image
          src="/icons/theme-switch.png"
          alt="theme-switch"
          width={35}
          height={35}
        />
      </button>

      {!isLoggedIn ? (
        <button
          onClick={() => openModal("login")}
          className="flex items-center gap-2 rounded-lg border-2 border-neutral-500 px-2.5 py-1.5 transition-colors cursor-pointer"
        >
          Sign In
          <Image
            src="/icons/sign-in-icon.svg"
            alt="sign-in"
            width={20}
            height={20}
          />
        </button>
      ) : (
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className={`flex items-center gap-2 rounded-lg bg-neutral-600 px-4 py-2 text-white shadow-md shadow-blue-950/30 transition cursor-pointer
            ${
              signingOut
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-neutral-700"
            }`}
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      )}
    </nav>
  );
}
