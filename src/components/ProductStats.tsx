/**
 * 상품 상세에 붙는 관심도 표시.
 *
 * - 조회: 이 상품을 본 사람 수 (같은 사람은 한 번만, 판매자 본인은 제외)
 * - 가격 네고: 지금 답변을 기다리는 가격 인하 요청을 보낸 사람 수
 * - 대화: 채팅 기능을 만들면 채워진다 (지금은 준비 중)
 */
export default function ProductStats({
  viewCount,
  offerCount,
  likeCount,
  chatCount = null,
}: {
  viewCount: number;
  offerCount: number;
  likeCount: number;
  /** 채팅 기능이 생기기 전까지는 null */
  chatCount?: number | null;
}) {
  const items = [
    {
      icon: "👀",
      label: "조회",
      value: viewCount,
      hint: "본 사람 수",
      ready: true,
    },
    {
      icon: "💸",
      label: "가격 네고",
      value: offerCount,
      hint: "인하 요청한 사람 수",
      ready: true,
    },
    {
      icon: "💬",
      label: "대화",
      value: chatCount,
      hint: "채팅 기능 준비 중",
      ready: chatCount !== null,
    },
    {
      icon: "❤️",
      label: "좋아요",
      value: likeCount,
      hint: "좋아요 누른 사람 수",
      ready: true,
    },
  ];

  return (
    <div className="grid grid-cols-4 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {items.map((item) => (
        <div
          key={item.label}
          className={`px-3 py-4 text-center ${item.ready ? "" : "opacity-55"}`}
          title={item.hint}
        >
          <p className="text-lg leading-none" aria-hidden>
            {item.icon}
          </p>
          <p className="mt-2 text-xl font-extrabold tabular-nums">
            {item.ready ? (
              <>
                {item.value}
                <span className="ml-0.5 text-sm font-bold">명</span>
              </>
            ) : (
              <span className="text-base font-semibold text-muted">–</span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted">{item.label}</p>
          {!item.ready && (
            <p className="mt-0.5 text-[11px] text-muted">준비 중</p>
          )}
        </div>
      ))}
    </div>
  );
}
