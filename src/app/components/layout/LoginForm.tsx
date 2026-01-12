"use client";

import { useState } from "react";

import Image from "next/image";
import { FaApple, FaCheck } from "react-icons/fa6";

import { signIn } from "@/lib/auth-client";
import type { LoginFormData } from "@/app/helpers/login-schema";
import { loginSchema } from "@/app/helpers/login-schema";

import { useAuth } from "@/context/AuthContext";

type Provider = "google" | "facebook" | "apple";

export default function LoginForm() {
  const { switchForm } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});

  const handleSocialSignIn = async (provider: Provider) => {
    try {
      setSocialLoading(true);
      await signIn.social({ provider });
    } catch (err) {
      console.error("Social sign-in error:", err);
    } finally {
      setSocialLoading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      const validationErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof LoginFormData;
        validationErrors[field] = err.message;
      });
      setErrors(validationErrors || "Something Went wrong.");
      return;
    }

    console.log("Login:", { ...result.data, staySignedIn });
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
          Sign In
        </h2>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Input */}
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nickname"
            className={`mt-2 w-full rounded-lg bg-neutral-700 px-4 py-2.5 text-neutral-300  placeholder-neutral-500 transition-colors outline-none shadow-md ${
              errors.username ? "border border-red-500" : ""
            }`}
            required
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`mt-2 w-full rounded-lg bg-neutral-700 px-4 py-2.5 text-neutral-300 placeholder-neutral-500 transition-colors outline-none shadow-md ${
              errors.password ? "border border-red-500" : ""
            }`}
            required
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Custom Stay signed in checkbox */}
        <div className="flex items-center">
          <label
            htmlFor="stay-signed-in"
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              id="stay-signed-in"
              type="checkbox"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
              className="sr-only peer"
              aria-checked={staySignedIn}
            />

            <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-gray-600 bg-neutral-800 transition-colors peer-checked:bg-cyan-700 peer-checked:border-cyan-700">
              {staySignedIn && <FaCheck size={14} />}
            </span>

            <span className="text-sm text-neutral-300">Stay signed in</span>
          </label>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-cyan-800 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-cyan-900 cursor-pointer"
        >
          Sign In
        </button>
        <button
          onClick={() => switchForm("forgot")}
          className="block w-full text-sm text-cyan-500 transition-colors hover:text-cyan-600 cursor-pointer"
        >
          Forgot Password?
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t dark:border-neutral-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-neutral-800 text-neutral-400">Or also</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="flex flex-col items-center gap-3">
        {/* Facebook */}
        <button
          type="button"
          onClick={() => handleSocialSignIn("facebook")}
          className="flex w-64 items-center px-4 rounded-lg border border-neutral-500 py-2 transition-colors bg-neutral-700 hover:bg-neutral-600 cursor-pointer gap-3"
        >
          <Image
            src="/icons/facebook.svg"
            alt="Facebook"
            width={24}
            height={24}
          />
          Sign In with Facebook
        </button>
        {/* Google */}
        <button
          type="button"
          onClick={() => handleSocialSignIn("google")}
          disabled={socialLoading}
          className={`flex w-64 items-center px-4 rounded-lg border border-neutral-500 py-2 transition-colors bg-neutral-700 hover:bg-neutral-600  gap-3 disabled:opacity-60 ${
            socialLoading
              ? "cursor-not-allowed pointer-events-none"
              : "cursor-pointer"
          }`}
        >
          <Image src="/icons/google.svg" alt="Google" width={24} height={24} />
          {socialLoading ? "Signing in..." : "Sign In with Google"}
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={() => handleSocialSignIn("apple")}
          className="flex w-64 items-center px-4 rounded-lg border border-neutral-500 py-2 transition-colors bg-neutral-700 hover:bg-neutral-600 cursor-pointer gap-3 disabled:opacity-60"
        >
          <FaApple size={24} />
          Sign In with Apple
        </button>
      </div>

      {/* Footer Links */}
      <div className="space-y-2 border-t border-neutral-600 pt-4 ">
        <button
          onClick={() => switchForm("register")}
          className="block w-full text-center text-sm text-neutral-500 dark:text-gray-40 cursor-pointer "
        >
          Don't have an account?{" "}
          <span className="font-semibold text-cyan-600 transition-colors hover:text-cyan-700">
            Sign up
          </span>
        </button>
      </div>
    </div>
  );
}
