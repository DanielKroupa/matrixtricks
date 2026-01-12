"use client";

import { useState } from "react";

import type { RegisterFormData } from "@/app/helpers/register-schema";

import { useAuth } from "@/context/AuthContext";
import { authClient } from "@/lib/auth-client";

import { useRouter } from "next/router";

export default function RegisterForm() {
  const { switchForm } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit({ email, password, username }: RegisterFormData) {
    setErrors(null);

    const {} = await authClient.signUp.email({
      email,
      password,
      username,
      callbackURL: "/email-verified",
    });

    if (errors) {
      setErrors("Something went wrong");
    } else {
      console.log("Signed up successfully");
      router.push("/");
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Join MatrixTricks today
        </p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className={`mt-2 w-full rounded-lg bg-neutral-700 px-4 py-2.5 text-neutral-300 placeholder-neutral-500 transition-colors outline-none shadow-md ${
              errors.email ? "border border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Username Input */}
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            className={`mt-2 w-full rounded-lg bg-neutral-700 px-4 py-2.5 text-neutral-300 placeholder-neutral-500 transition-colors outline-none shadow-md ${
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
            placeholder="Create a password"
            className={`mt-2 w-full rounded-lg bg-neutral-700 px-4 py-2.5 text-neutral-300 placeholder-neutral-500 transition-colors outline-none shadow-md ${
              errors.password ? "border border-red-500" : ""
            }`}
            required
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className={`mt-2 w-full rounded-lg bg-neutral-700 px-4 py-2.5 text-neutral-300 placeholder-neutral-500 transition-colors outline-none shadow-md ${
              errors.confirmPassword ? "border border-red-500" : ""
            }`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Sign Up Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-cyan-800 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-cyan-900 cursor-pointer"
        >
          Sign Up
        </button>
      </form>

      {/* Footer Links */}
      <div className="border-t pt-4 border-neutral-600">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => switchForm("login")}
            className="font-semibold text-cyan-600 transition-colors hover:text-cyan-700 cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
