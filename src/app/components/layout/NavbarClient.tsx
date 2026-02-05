"use client";

import Link from "next/link";
import { ChevronDownIcon, MenuIcon, PlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { IoSettings } from "react-icons/io5";
import { FaUser } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";

import { authClient } from "@/lib/auth-client";
import { User } from "@/lib/auth";

type Props = {
  initialSession: any;
  user?: User | null;
};

export default function NavbarClient({ initialSession, user }: Props) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState(initialSession);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const currentTheme = theme === "system" ? systemTheme : theme;

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const router = useRouter();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      setSession(null);
      router.push("/");
    } finally {
      setSigningOut(false);
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const isLoggedIn = session?.user;

  if (!mounted) return null;

  const displayName =
    session?.user?.name ?? session?.user?.username ?? "Username";
  const avatarSrc =
    session?.user?.image ?? user?.image ?? "/uploads/avatars/alien.png";

  return (
    <>
      <nav
        className={`flex w-full items-center justify-end gap-4 px-4 py-2 z-50 sticky top-0 backdrop-blur-lg transition-all duration-300
          ${scrolled ? "bg-neutral-200/80 dark:bg-neutral-700/80 shadow-md" : "bg-neutral-200 dark:bg-neutral-700"}`}
      >
        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => {
            setMobileMenuOpen((open) => !open);
            setProfileMenuOpen(false);
          }}
          className="flex items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer md:hidden"
        >
          {mobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
        </button>

        {/* Desktop: User profile dropdown */}
        {isLoggedIn && (
          <div ref={profileMenuRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen((open) => !open);
                setMobileMenuOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              aria-controls="profile-menu"
              className="flex items-center justify-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-2 py-1 dark:text-white text-black transition cursor-pointer"
            >
              <Image
                src={avatarSrc}
                alt="user avatar"
                width={32}
                height={32}
                className="w-8 h-8 object-cover rounded-full"
              />
              <p className="font-medium text-black dark:text-white">
                {displayName}
              </p>
              <ChevronDownIcon
                size={18}
                className={`transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : "rotate-0"}`}
              />
            </button>

            <div
              id="profile-menu"
              role="menu"
              className={`absolute right-0 top-full mt-2 w-48 rounded-lg border-2 border-neutral-400 dark:border-neutral-500 bg-neutral-200 dark:bg-neutral-700 shadow-md backdrop-blur-lg transition-all duration-150
                ${profileMenuOpen ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-1"}`}
            >
              <div className="flex flex-col gap-1 p-2">
                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-black dark:text-white transition hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  <FaUser className="text-neutral-600 dark:text-neutral-300" />
                  Profile
                </Link>
                <Link
                  href="/admin"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-black dark:text-white transition hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  <RiAdminFill className="text-neutral-600 dark:text-neutral-300" />
                  Admin settings
                </Link>
                <Link
                  href="/settings"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-black dark:text-white transition hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  <IoSettings className="text-neutral-600 dark:text-neutral-300" />
                  Settings
                </Link>
                <div className="my-1 h-px w-full bg-neutral-400/60 dark:bg-neutral-500/60" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-black dark:text-white transition
                    ${signingOut ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-300 cursor-pointer dark:hover:bg-neutral-600"}`}
                >
                  <FaSignOutAlt className="text-neutral-600 dark:text-neutral-300" />
                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoggedIn && (
          <button className="hidden md:flex items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer">
            <Image
              src="/icons/mail.svg"
              alt="mail"
              width={28}
              height={24}
              className="invert-50 dark:invert-0"
            />
          </button>
        )}

        <button className="hidden md:flex items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 dark:border-neutral-500 border-neutral-400 px-3 py-2 dark:text-white text-black transition cursor-pointer">
          <Image
            src="/icons/lang-cs.png"
            alt="lang-switch"
            width={24}
            height={24}
            className="object-contain"
          />
          <span>CS &gt;</span>
        </button>

        {user?.role === "admin" && (
          <Link
            href="/new-post"
            className="hidden md:flex items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer"
          >
            <PlusIcon size={20} />
            New post
          </Link>
        )}

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="hidden md:flex items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer"
        >
          <Image
            src="/icons/theme-switch.png"
            alt="theme-switch"
            width={24}
            height={24}
            className="object-contain invert-75 dark:invert-0"
          />
        </button>

        {!isLoggedIn ? (
          <Link
            href="/sign-in"
            className="hidden md:flex items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer"
          >
            Sign In
            <Image
              src="/icons/sign-in-icon.svg"
              alt="sign-in"
              width={20}
              height={20}
              className="invert-75 dark:invert-0"
            />
          </Link>
        ) : null}
      </nav>

      {/* Mobile overlay + drawer (responsive) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-200
          ${mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex h-full w-full">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMobileMenuOpen(false)}
            className="hidden sm:block h-full flex-1 bg-black/35"
          />

          <div
            className={`h-full w-full sm:w-3/4 border-l-2 border-neutral-400 dark:border-neutral-500 bg-neutral-200 dark:bg-neutral-700 shadow-lg backdrop-blur-lg transition-transform duration-200
              ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex items-center justify-between gap-3 p-4 border-b-2 border-neutral-400/60 dark:border-neutral-500/60">
              <div className="flex items-center gap-3">
                <Image
                  src={avatarSrc}
                  alt="user avatar"
                  width={36}
                  height={36}
                  className="w-9 h-9 object-cover rounded-full"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-black dark:text-white">
                    {isLoggedIn ? displayName : "Matrix Tricks"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2 p-4">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition hover:bg-neutral-300/80 dark:hover:bg-neutral-600/80"
                  >
                    <FaUser className="text-neutral-600 dark:text-neutral-300" />
                    Profile
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      href="/new-post"
                      className="hidden md:flex items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer"
                    >
                      <PlusIcon size={20} />
                      New post
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition hover:bg-neutral-300/80 dark:hover:bg-neutral-600/80"
                  >
                    <IoSettings className="text-neutral-600 dark:text-neutral-300" />
                    Settings
                  </Link>

                  <hr className="my-2 text-neutral-600 mx- border rounded-full" />
                  <div className="flex gap-8">
                    <button
                      type="button"
                      title="Toggle Theme"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        toggleTheme();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer hover:bg-neutral-300/80 dark:hover:bg-neutral-600/80"
                    >
                      <Image
                        src="/icons/theme-switch.png"
                        alt="theme-switch"
                        width={20}
                        height={20}
                        className="object-contain invert-75 dark:invert-0"
                      />
                      Switch Theme
                    </button>

                    <button className="flex justify-center w-full items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer hover:bg-neutral-300/80 dark:hover:bg-neutral-600/80">
                      <Image
                        src="/icons/lang-cs.png"
                        alt="lang-switch"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                      <span>CS &gt;</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={signingOut}
                    onClick={handleSignOut}
                    className={`flex w-full items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer
                      ${signingOut ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-300/80 dark:hover:bg-neutral-600/80"}`}
                  >
                    <FaSignOutAlt />
                    {signingOut ? "Signing out..." : "Sign out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer hover:bg-neutral-300/80 dark:hover:bg-neutral-600/80"
                  >
                    Sign In
                    <Image
                      src="/icons/sign-in-icon.svg"
                      alt="sign-in"
                      width={20}
                      height={20}
                      className="invert-75 dark:invert-0"
                    />
                  </Link>
                  <div className="flex gap-8">
                    <button
                      type="button"
                      title="Toggle Theme"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        toggleTheme();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer hover:bg-neutral-300/80 dark:hover:bg-neutral-600/80"
                    >
                      <Image
                        src="/icons/theme-switch.png"
                        alt="theme-switch"
                        width={20}
                        height={20}
                        className="object-contain invert-75 dark:invert-0"
                      />
                      Switch Theme
                    </button>

                    <button className="flex justify-center w-full items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 border-neutral-400 dark:border-neutral-500 px-3 py-2 dark:text-white text-black transition cursor-pointer hover:bg-neutral-300/80 dark:hover:bg-neutral-600/80">
                      <Image
                        src="/icons/lang-cs.png"
                        alt="lang-switch"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                      <span>CS &gt;</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
