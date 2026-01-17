import NavbarClient from "./NavbarClient";
import { getServerSession } from "@/lib/get-session";
import { User } from "@/lib/auth";

export async function Navbar() {
  const session = await getServerSession();
  const user: User | null = session?.user || null;

  return <NavbarClient initialSession={session} user={user!} />;
}
