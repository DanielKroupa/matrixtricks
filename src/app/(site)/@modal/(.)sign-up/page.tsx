import RegisterForm from "@/app/components/authLayout/RegisterForm";
import type { Metadata } from "next";

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
