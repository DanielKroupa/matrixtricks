import type { Metadata } from "next";
import { forbidden, unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import AdminChatClient from "./AdminChatClient";

export const metadata: Metadata = {
  title: "Admin settings | Chat",
  description: "Admin-user chat inbox",
};

export default async function AdminChatPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    unauthorized();
  }

  if (user.role !== "admin") {
    forbidden();
  }

  return <AdminChatClient />;
}
