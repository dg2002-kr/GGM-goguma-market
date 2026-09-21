import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "고구마마켓 - 우리 동네 중고거래",
  description: "믿을 수 있는 이웃 간 중고거래, 고구마마켓",
};

export const viewport: Viewport = {
  themeColor: "#fffaf5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-dvh">
        <Header />
        <main>{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-xs text-muted">
          🍠 고구마마켓 · 개발 공부용 프로젝트
        </footer>
      </body>
    </html>
  );
}
