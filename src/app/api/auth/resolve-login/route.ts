import { NextResponse } from "next/server";
import { usernameService } from "@/services/account/username.service";

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

    const email = await usernameService.resolveLoginEmail(rawLogin);

    if (!email) {
      return NextResponse.json({ email: null });
    }

    return NextResponse.json({ email });
  } catch {
    return NextResponse.json(
      { error: "Failed to resolve login" },
      { status: 500 },
    );
  }
}
