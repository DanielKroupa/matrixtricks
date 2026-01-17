"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  RegisterFormData,
  registerSchema,
} from "@/app/helpers/register-schema";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const { closeModal } = useAuth();

  async function onSubmit({ email, password, username }: RegisterFormData) {
    setServerError(null);
    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        email,
        name: username,
        password,
        callbackURL: "/",
      });

      if (result.error) {
        setServerError(result.error.message || "Sign up failed");
      } else {
        // close modal (when used inside modal) and navigate home without router
        closeModal();
        // use full page navigation to ensure session state updates
        window.location.assign("/");
      }
    } catch (err: any) {
      setServerError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Join MatrixTricks today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="email"
            {...register("email")}
            autoComplete="email"
            placeholder="Enter your email"
            className={`mt-2 w-full rounded-lg dark:bg-neutral-700 bg-neutral-300 px-4 py-2.5 dark:text-neutral-300 text-neutral-700  placeholder-neutral-500 transition-colors outline-none dark:shadow-md ${
              errors.email ? "border border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            {...register("username")}
            autoComplete="username"
            placeholder="Choose a username"
            className={`mt-2 w-full rounded-lg dark:bg-neutral-700 bg-neutral-300 px-4 py-2.5 dark:text-neutral-300 text-neutral-700  placeholder-neutral-500 transition-colors outline-none dark:shadow-md ${
              errors.username ? "border border-red-500" : ""
            }`}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            {...register("password")}
            autoComplete="new-password"
            placeholder="Create a password"
            className={`mt-2 w-full rounded-lg dark:bg-neutral-700 bg-neutral-300 px-4 py-2.5 dark:text-neutral-300 text-neutral-700  placeholder-neutral-500 transition-colors outline-none dark:shadow-md ${
              errors.password ? "border border-red-500" : ""
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            {...register("confirmPassword")}
            autoComplete="off"
            placeholder="Confirm your password"
            className={`mt-2 w-full rounded-lg dark:bg-neutral-700 bg-neutral-300 px-4 py-2.5 dark:text-neutral-300 text-neutral-700  placeholder-neutral-500 transition-colors outline-none dark:shadow-md ${
              errors.confirmPassword ? "border border-red-500" : ""
            }`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <button
          disabled={loading}
          type="submit"
          className={`w-full rounded-lg bg-cyan-800 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-cyan-900 
          ${loading ? "opacity-50 cursor-not-allowed bg-cyan-900" : "cursor-pointer"}`}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <div className="border-t pt-4 dark:border-neutral-600 border-neutral-300">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-cyan-600 transition-colors hover:text-cyan-700 cursor-pointer"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
