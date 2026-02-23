export function Copyright() {
  const copyrightDate = new Date().getFullYear();

  return (
    <div className="py-2 dark:bg-neutral-800 bg-neutral-400 w-full flex justify-center">
      <p>© 2025 - {copyrightDate} MatrixTricks.com</p>
    </div>
  );
}
