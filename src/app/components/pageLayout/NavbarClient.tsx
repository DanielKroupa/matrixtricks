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
import Badge from "../ui/Badge";

type Props = {
  initialSession: any;
  user?: User | null;
  isVipActive?: boolean;
};

export default function NavbarClient({
  initialSession,
  user,
  isVipActive = false,
}: Props) {
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
        className={`sticky top-0 z-50 flex w-full items-center justify-end gap-4 px-4 py-2 backdrop-blur-lg transition-all duration-300 ${scrolled ? "bg-neutral-200/80 shadow-md dark:bg-neutral-700/80" : "bg-neutral-200 dark:bg-neutral-700"}`}
      >
        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => {
            setMobileMenuOpen((open) => !open);
            setProfileMenuOpen(false);
          }}
          className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition md:hidden dark:border-neutral-500 dark:bg-neutral-600 dark:text-white"
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
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-2 py-1 text-black transition dark:border-neutral-500 dark:bg-neutral-600 dark:text-white"
            >
              <Image
                src={avatarSrc}
                alt="user avatar"
                width={32}
                height={32}
                style={{ height: "auto" }}
                className="h-8 w-8 rounded-full object-cover"
              />
              <p className="font-medium text-black dark:text-white">
                {displayName}
              </p>
              {isVipActive && <Badge className="ml-1" />}
              <ChevronDownIcon
                size={18}
                className={`transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : "rotate-0"}`}
              />
            </button>

            <div
              id="profile-menu"
              role="menu"
              className={`absolute top-full right-0 mt-2 w-48 rounded-lg border-2 border-neutral-400 bg-neutral-200 shadow-md backdrop-blur-lg transition-all duration-150 dark:border-neutral-500 dark:bg-neutral-700 ${profileMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}
            >
              <div className="flex flex-col gap-1 p-2">
                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-black transition hover:bg-neutral-300 dark:text-white dark:hover:bg-neutral-600"
                >
                  <FaUser className="text-neutral-600 dark:text-neutral-300" />
                  Profile
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    role="menuitem"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-black transition hover:bg-neutral-300 dark:text-white dark:hover:bg-neutral-600"
                  >
                    <RiAdminFill className="text-neutral-600 dark:text-neutral-300" />
                    Admin settings
                  </Link>
                )}
                {user?.role !== "admin" && (
                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-black transition hover:bg-neutral-300 dark:text-white dark:hover:bg-neutral-600"
                  >
                    <IoSettings className="text-neutral-600 dark:text-neutral-300" />
                    Settings
                  </Link>
                )}

                <div className="my-1 h-px w-full bg-neutral-400/60 dark:bg-neutral-500/60" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-black transition dark:text-white ${signingOut ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-600"}`}
                >
                  <FaSignOutAlt className="text-neutral-600 dark:text-neutral-300" />
                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoggedIn && (
          <button className="hidden cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition md:flex dark:border-neutral-500 dark:bg-neutral-600 dark:text-white">
            <Image
              src="/icons/mail.svg"
              alt="mail"
              width={28}
              style={{ height: "auto" }}
              height={24}
              className="invert-50 dark:invert-0"
            />
          </button>
        )}

        <button className="hidden cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition md:flex dark:border-neutral-500 dark:bg-neutral-600 dark:text-white">
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
            className="hidden cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition md:flex dark:border-neutral-500 dark:bg-neutral-600 dark:text-white"
          >
            <PlusIcon size={20} />
            New post
          </Link>
        )}

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="hidden cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition md:flex dark:border-neutral-500 dark:bg-neutral-600 dark:text-white"
        >
          <Image
            src="/icons/theme-switch.png"
            alt="theme-switch"
            style={{ height: "auto" }}
            width={24}
            height={24}
            className="object-contain invert-75 dark:invert-0"
          />
        </button>

        {!isLoggedIn ? (
          <Link
            href="/sign-in"
            className="hidden cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition md:flex dark:border-neutral-500 dark:bg-neutral-600 dark:text-white"
          >
            Sign In
            <Image
              src="/icons/sign-in-icon.svg"
              alt="sign-in"
              style={{ height: "auto" }}
              width={20}
              height={20}
              className="invert-75 dark:invert-0"
            />
          </Link>
        ) : null}
      </nav>

      {/* Mobile overlay + drawer (responsive) */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 md:hidden ${mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex h-full w-full">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMobileMenuOpen(false)}
            className="hidden h-full flex-1 bg-black/35 sm:block"
          />

          <div
            className={`h-full w-full border-l-2 border-neutral-400 bg-neutral-200 shadow-lg backdrop-blur-lg transition-transform duration-200 sm:w-3/4 dark:border-neutral-500 dark:bg-neutral-700 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex items-center justify-between gap-3 border-b-2 border-neutral-400/60 p-4 dark:border-neutral-500/60">
              <div className="flex items-center gap-3">
                <Image
                  src={avatarSrc}
                  alt="user avatar"
                  width={36}
                  style={{ height: "auto" }}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
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
                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition dark:border-neutral-500 dark:bg-neutral-600 dark:text-white"
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
                    className="flex w-full items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition hover:bg-neutral-300/80 dark:border-neutral-500 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-600/80"
                  >
                    <FaUser className="text-neutral-600 dark:text-neutral-300" />
                    Profile
                  </Link>

                  {user?.role !== "admin" && (
                    <Link
                      href="/admin"
                      className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition md:flex dark:border-neutral-500 dark:bg-neutral-600 dark:text-white"
                    >
                      <RiAdminFill
                        size={20}
                        className="text-neutral-600 dark:text-neutral-300"
                      />
                      Admin settings
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition hover:bg-neutral-300/80 dark:border-neutral-500 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-600/80"
                  >
                    <IoSettings className="text-neutral-600 dark:text-neutral-300" />
                    Settings
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      href="/new-post"
                      className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition md:flex dark:border-neutral-500 dark:bg-neutral-600 dark:text-white"
                    >
                      <PlusIcon
                        size={20}
                        className="text-neutral-600 dark:text-neutral-300"
                      />
                      New post
                    </Link>
                  )}

                  <hr className="my-2 rounded-full border text-neutral-400 dark:text-neutral-600" />
                  <div className="flex gap-8">
                    <button
                      type="button"
                      title="Toggle Theme"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        toggleTheme();
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition hover:bg-neutral-300/80 dark:border-neutral-500 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-600/80"
                    >
                      <Image
                        src="/icons/theme-switch.png"
                        style={{ height: "auto" }}
                        alt="theme-switch"
                        width={20}
                        height={20}
                        className="object-contain invert-75 dark:invert-0"
                      />
                      Switch Theme
                    </button>

                    <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition hover:bg-neutral-300/80 dark:border-neutral-500 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-600/80">
                      <Image
                        src="/icons/lang-cs.png"
                        alt="lang-switch"
                        width={24}
                        style={{ height: "auto" }}
                        height={24}
                        className="object-contain"
                      />
                      <span>CS &gt;</span>
                    </button>
                  </div>
                  <hr className="my-2 rounded-full border text-neutral-400 dark:text-neutral-600" />
                  <button
                    type="button"
                    disabled={signingOut}
                    onClick={handleSignOut}
                    className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition dark:border-neutral-500 dark:bg-neutral-600 dark:text-white ${signingOut ? "cursor-not-allowed opacity-50" : "hover:bg-neutral-300/80 dark:hover:bg-neutral-600/80"}`}
                  >
                    <FaSignOutAlt className="fill-neutral-600 dark:fill-white" />
                    {signingOut ? "Signing out..." : "Sign out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition hover:bg-neutral-300/80 dark:border-neutral-500 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-600/80"
                  >
                    Sign In
                    <Image
                      src="/icons/sign-in-icon.svg"
                      alt="sign-in"
                      width={20}
                      style={{ height: "auto" }}
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
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition hover:bg-neutral-300/80 dark:border-neutral-500 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-600/80"
                    >
                      <Image
                        src="/icons/theme-switch.png"
                        alt="theme-switch"
                        width={20}
                        style={{ height: "auto" }}
                        height={20}
                        className="object-contain invert-75 dark:invert-0"
                      />
                      Switch Theme
                    </button>

                    <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-3 py-2 text-black transition hover:bg-neutral-300/80 dark:border-neutral-500 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-600/80">
                      <Image
                        src="/icons/lang-cs.png"
                        alt="lang-switch"
                        width={24}
                        style={{ height: "auto" }}
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
