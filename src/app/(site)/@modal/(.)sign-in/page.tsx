import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Matrix Tricks",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <LoginForm />;
}
