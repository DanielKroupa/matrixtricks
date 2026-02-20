import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ResolveLoginBody = {
  login?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResolveLoginBody;
    const rawLogin = body?.login?.trim();

    if (!rawLogin) {
      return NextResponse.json({ error: "Missing login" }, { status: 400 });
    }

    if (rawLogin.includes("@")) {
      return NextResponse.json({ email: rawLogin });
    }

    const user = await prisma.user.findUnique({
      where: { username: rawLogin },
      select: { email: true },
    });

    if (!user?.email) {
      return NextResponse.json({ email: null });
    }

    return NextResponse.json({ email: user.email });
  } catch {
    return NextResponse.json(
      { error: "Failed to resolve login" },
      { status: 500 },
    );
  }
}
