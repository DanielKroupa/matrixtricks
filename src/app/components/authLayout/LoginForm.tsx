"use client";

import { useState } from "react";
import Link from "next/link";

import { loginSchema, LoginFormData } from "@/app/helpers/login-schema";

import Image from "next/image";
import { FaApple, FaCheck, FaEye, FaEyeSlash } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { authClient } from "@/lib/auth-client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/ui/PrimaryButton";

type Provider = "google" | "facebook" | "apple";

export default function LoginForm() {
  const { switchForm } = useAuth();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSocialSignIn = async (provider: Provider) => {
    try {
      setSocialLoading(true);
      await authClient.signIn.social({ provider });
    } catch (err) {
      console.error("Social sign-in error:", err);
    } finally {
      setSocialLoading(false);
    }
  };
  const router = useRouter();
  const { closeModal } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  async function onSubmit({ email, password, rememberMe }: LoginFormData) {
    setServerError(null);
    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe: rememberMe ?? false,
        callbackURL: "/",
      });

      if (error) {
        setServerError(
          typeof error === "string"
            ? error
            : error.message || "Something went wrong",
        );
        console.log(error);
      } else {
        // close modal, navigate home and refresh to update session state
        closeModal();
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setServerError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Input */}
        <div>
          <input
            type="email"
            {...register("email")}
            autoFocus
            placeholder="Email"
            className={`mt-2 w-full rounded-lg dark:bg-neutral-700 bg-neutral-300 px-4 py-2.5 dark:text-neutral-300 text-neutral-700  placeholder-neutral-500 transition-colors outline-none dark:shadow-md ${
              errors.email ? "border border-red-500" : ""
            }`}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="Password"
            className={`mt-2 w-full rounded-lg dark:bg-neutral-700 bg-neutral-300 px-4 pr-10 py-2.5 dark:text-neutral-300 text-neutral-700  placeholder-neutral-500 transition-colors outline-none dark:shadow-md ${
              errors.password ? "border border-red-500" : ""
            }`}
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-7.5 -translate-y-1/2 text-neutral-600 hover:text-neutral-900"
          >
            {showPassword ? (
              <FaEyeSlash
                size={20}
                className="cursor-pointer dark:text-neutral-500 dark:hover:text-neutral-400"
                title="Show password"
              />
            ) : (
              <FaEye
                size={20}
                className="cursor-pointer dark:text-neutral-500 dark:hover:text-neutral-400"
                title="Hide password"
              />
            )}
          </button>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
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
              {...register("rememberMe")}
              className="sr-only peer"
              aria-checked={watch("rememberMe")}
            />

            <span className="inline-flex h-5 w-5 items-center justify-center border-gray-400 rounded border dark:border-gray-600 dark:bg-neutral-800 bg-neutral-300 transition-colors peer-checked:bg-cyan-700 peer-checked:border-cyan-700">
              {watch("rememberMe") && (
                <FaCheck size={14} className="text-white" />
              )}
            </span>

            <span className="text-sm dark:text-neutral-300 text-neutral-700">
              Stay signed in
            </span>
          </label>
        </div>

        {serverError && (
          <p className="mt-1 text-sm text-red-500">{serverError}</p>
        )}

        {/* Sign In Button */}
        <PrimaryButton
          type="submit"
          loading={loading}
          loadingText="Signing in..."
        >
          Sign In
        </PrimaryButton>
        <Link
          href="/forgot-password"
          className="block w-full text-center text-sm dark:text-cyan-500 text-cyan-700 hover:text-cyan-900 dark:hover:text-cyan-600 cursor-pointer"
        >
          Forgot your Password?
        </Link>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-300 dark:border-neutral-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 dark:bg-neutral-800 bg-white text-neutral-400">
            Or also
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="flex flex-col items-center gap-3">
        {/* Facebook */}
        <button
          type="button"
          onClick={() => handleSocialSignIn("facebook")}
          className="flex w-64 cursor-pointer items-center px-4 border-neutral-400 hover:bg-neutral-300 rounded-lg border text-black py-2 transition-colors bg-neutral-200 gap-3 disabled:opacity-60  dark:text-white  dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:border-neutral-500"
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
          className={`flex w-64 items-center px-4 border-neutral-400 hover:bg-neutral-300 rounded-lg border text-black py-2 transition-colors bg-neutral-200 gap-3 disabled:opacity-60  dark:text-white  dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:border-neutral-500 ${
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
          className="flex w-64 cursor-pointer items-center px-4 border-neutral-400 hover:bg-neutral-300 rounded-lg border text-black py-2 transition-colors bg-neutral-200 gap-3 disabled:opacity-60  dark:text-white  dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:border-neutral-500"
        >
          <FaApple size={24} />
          Sign In with Apple
        </button>
      </div>

      {/* Footer Links */}
      <div className="space-y-2 border-t dark:border-neutral-600 border-neutral-300 pt-4 ">
        <button
          onClick={() => switchForm("register")}
          className="block w-full text-center text-sm text-neutral-500"
        >
          Don't have an account?
          <Link
            href="/sign-up"
            className="font-semibold text-cyan-600 transition-colors hover:text-cyan-700 cursor-pointer ml-1"
          >
            Sign up
          </Link>
        </button>
      </div>
    </div>
  );
}
