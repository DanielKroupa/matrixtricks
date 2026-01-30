import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex grow items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2x1 font-semibold">401 - Unauthorized</h1>
          <p className="text-muted-foreground">Please sign in to continue.</p>
        </div>
        <div>
          <Link href="/sign-in">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
