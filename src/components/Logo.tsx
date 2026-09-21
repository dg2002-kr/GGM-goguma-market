import Link from "next/link";

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const isLg = size === "lg";
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${
        isLg ? "text-2xl" : "text-lg"
      }`}
    >
      <span
        className={`grid place-items-center rounded-xl bg-primary-soft ${
          isLg ? "h-11 w-11 text-2xl" : "h-8 w-8 text-lg"
        }`}
        aria-hidden
      >
        🍠
      </span>
      <span>
        고구마<span className="text-primary">마켓</span>
      </span>
    </Link>
  );
}
