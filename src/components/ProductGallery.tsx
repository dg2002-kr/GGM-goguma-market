"use client";

import Image from "next/image";
import { useState } from "react";
import { productImageUrl } from "@/lib/supabase/storage";

/** 큰 사진 1장 + 아래 썸네일로 넘겨 보는 갤러리 */
export default function ProductGallery({
  paths,
  title,
}: {
  paths: string[];
  title: string;
}) {
  const [current, setCurrent] = useState(0);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2">
        <Image
          src={productImageUrl(paths[current])}
          alt={`${title} 사진 ${current + 1}`}
          fill
          sizes="(max-width: 672px) 100vw, 672px"
          className="object-contain"
          priority
        />

        {paths.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-foreground/60 px-2.5 py-1 text-xs font-semibold text-white">
            {current + 1} / {paths.length}
          </span>
        )}
      </div>

      {paths.length > 1 && (
        <div className="ggm-scroll-x mt-3 flex gap-2 overflow-x-auto">
          {paths.map((path, index) => (
            <button
              key={path}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`사진 ${index + 1} 보기`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                index === current
                  ? "border-primary"
                  : "border-transparent opacity-65 hover:opacity-100"
              }`}
            >
              <Image
                src={productImageUrl(path)}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
