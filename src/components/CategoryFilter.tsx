import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

/** 쿼리스트링(?category=)으로 동작하는 카테고리 필터 */
export default function CategoryFilter({ selected }: { selected?: string }) {
  return (
    <div className="ggm-scroll-x -mx-4 overflow-x-auto px-4 pb-1">
      <div className="flex w-max gap-2">
        <Chip href="/" active={!selected}>
          전체
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.value}
            href={`/?category=${encodeURIComponent(c.value)}`}
            active={selected === c.value}
          >
            {c.emoji} {c.value}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${
        active
          ? "bg-primary text-white"
          : "border border-border bg-surface text-muted hover:bg-surface-2 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
