import { Metadata } from "next";
import { getServerSession } from "@/lib/get-session";

import { unauthorized } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings | Matrix Tricks",
};

export default async function Page() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    unauthorized();
  }
  return <>asdsd</>;
}
