/**
 * 목록 카드에 한 줄로 들어가는 작은 숫자들.
 * 상세 화면의 큰 칸(ProductStats)과 같은 숫자를 좁은 자리에 보여 준다.
 */
export default function ProductStatsInline({
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
    { icon: "👀", value: viewCount, label: "조회한 사람" },
    { icon: "💸", value: offerCount, label: "가격 네고중인 사람" },
    { icon: "💬", value: chatCount, label: "대화중인 사람 (준비 중)" },
    { icon: "❤️", value: likeCount, label: "좋아요" },
  ];

  return (
    <p className="flex items-center gap-2.5 text-xs text-muted">
      {items.map((item) => (
        <span
          key={item.icon}
          title={item.label}
          className={`inline-flex items-center gap-1 ${
            item.value === null ? "opacity-45" : ""
          }`}
        >
          <span aria-hidden>{item.icon}</span>
          <span className="tabular-nums">
            {item.value === null ? "–" : item.value}
          </span>
          <span className="sr-only">{item.label}</span>
        </span>
      ))}
    </p>
  );
}
