import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign up | Matrix Tricks",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <RegisterForm />;
}
