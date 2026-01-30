import Link from "next/link";
export default function ForbiddenPage() {
  return (
    <main className="flex grow items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2x1 font-semibold">403 - Forbidden</h1>
          <p className="text-muted-foreground">
            You don&apos;t have access to this page.
          </p>
        </div>
        <div>
          <Link href="/">Go to Main page</Link>
        </div>
      </div>
    </main>
  );
}
