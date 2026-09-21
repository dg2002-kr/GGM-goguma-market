export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl bg-danger/8 px-4 py-3 text-sm text-danger"
    >
      <span aria-hidden>⚠️</span>
      <span>{children}</span>
    </p>
  );
}

export function SuccessMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-xl bg-primary-soft px-4 py-3 text-sm text-foreground"
    >
      <span aria-hidden>✉️</span>
      <span>{children}</span>
    </p>
  );
}
