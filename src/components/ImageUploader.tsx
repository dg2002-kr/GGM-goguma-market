"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGES,
  PRODUCT_BUCKET,
  buildImagePath,
  productImageUrl,
} from "@/lib/supabase/storage";

type Item = {
  /** Storage 안의 경로. 업로드가 끝나야 값이 생긴다. */
  path: string | null;
  /** 미리보기 주소 (업로드 전에는 브라우저가 만든 임시 URL) */
  previewUrl: string;
  uploading: boolean;
  /** 이번에 새로 올린 사진인지 (수정 화면에서 구분이 필요하다) */
  isNew: boolean;
};

/**
 * 파일을 서버 액션으로 보내지 않고 브라우저에서 Storage로 바로 올린다.
 * 폼에는 업로드된 '경로'만 hidden input 으로 넘긴다.
 */
export default function ImageUploader({
  userId,
  initialPaths = [],
}: {
  userId: string;
  /** 수정 화면에서 이미 올라가 있는 사진들 */
  initialPaths?: string[];
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>(() =>
    initialPaths.map((path) => ({
      path,
      previewUrl: productImageUrl(path),
      uploading: false,
      isNew: false,
    })),
  );
  const [error, setError] = useState<string | null>(null);

  const uploadedPaths = items
    .map((i) => i.path)
    .filter((p): p is string => Boolean(p));

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);

    const files = Array.from(fileList);
    const room = MAX_IMAGES - items.length;

    if (files.length > room) {
      setError(`사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있습니다.`);
    }

    for (const file of files.slice(0, Math.max(room, 0))) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("jpg, png, webp, gif 형식만 올릴 수 있습니다.");
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`'${file.name}' 은 5MB를 넘습니다.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      setItems((prev) => [
        ...prev,
        { path: null, previewUrl, uploading: true, isNew: true },
      ]);

      const path = buildImagePath(userId, file.name);
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError(`업로드 실패: ${uploadError.message}`);
        setItems((prev) => prev.filter((i) => i.previewUrl !== previewUrl));
        URL.revokeObjectURL(previewUrl);
        continue;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.previewUrl === previewUrl
            ? { ...item, path, previewUrl: productImageUrl(path), uploading: false }
            : item,
        ),
      );
    }

    // 같은 파일을 다시 고를 수 있도록 초기화
    if (inputRef.current) inputRef.current.value = "";
  }

  async function removeItem(target: Item) {
    setItems((prev) => prev.filter((i) => i !== target));

    // 방금 올린 사진은 아직 어디에도 안 붙어 있으므로 바로 지운다.
    // 원래 있던 사진은 '저장'을 눌렀을 때 서버 액션이 지운다.
    // (수정을 취소하면 사진이 그대로 남아 있어야 하니까)
    if (target.path && target.isNew) {
      await supabase.storage.from(PRODUCT_BUCKET).remove([target.path]);
    }
  }

  return (
    <div>
      <span className="ggm-label">
        사진{" "}
        <span className="font-normal text-muted">
          ({items.length}/{MAX_IMAGES})
        </span>
      </span>

      <div className="flex flex-wrap gap-2.5">
        {/* 추가 버튼 */}
        {items.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid h-24 w-24 place-items-center rounded-xl border border-dashed border-border-strong bg-surface text-muted transition hover:border-primary hover:bg-primary-soft hover:text-primary"
          >
            <span className="text-2xl leading-none" aria-hidden>
              ＋
            </span>
            <span className="mt-1 text-xs">사진 추가</span>
          </button>
        )}

        {items.map((item, index) => (
          <div
            key={item.previewUrl}
            className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-surface-2"
          >
            {/* 업로드 전 임시 URL은 next/image로 최적화할 수 없어 img를 쓴다 */}
            {item.uploading ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.previewUrl}
                alt=""
                className="h-full w-full object-cover opacity-50"
              />
            ) : (
              <Image
                src={item.previewUrl}
                alt={`상품 사진 ${index + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            )}

            {item.uploading && (
              <span className="absolute inset-0 grid place-items-center">
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-white/50 border-t-primary"
                  aria-hidden
                />
              </span>
            )}

            {index === 0 && !item.uploading && (
              <span className="absolute bottom-0 left-0 right-0 bg-foreground/65 py-0.5 text-center text-[11px] font-semibold text-white">
                대표 사진
              </span>
            )}

            {!item.uploading && (
              <button
                type="button"
                onClick={() => removeItem(item)}
                aria-label="사진 삭제"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-foreground/65 text-xs text-white transition hover:bg-danger"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* 서버 액션에는 업로드된 경로만 넘긴다 */}
      {uploadedPaths.map((path) => (
        <input key={path} type="hidden" name="image_paths" value={path} />
      ))}

      <p className="mt-2 text-xs text-muted">
        첫 번째 사진이 목록에 대표로 보입니다. 장당 5MB까지.
      </p>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
