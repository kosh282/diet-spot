import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const alt = SITE_DESCRIPTION;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFonts() {
  const dir = join(process.cwd(), "app/fonts");
  const [korean, latin] = await Promise.all([
    readFile(join(dir, "noto-sans-kr-korean-700.woff")),
    readFile(join(dir, "noto-sans-kr-latin-700.woff")),
  ]);
  return [
    { name: "Noto Sans KR", data: korean, weight: 700 as const, style: "normal" as const },
    { name: "Noto Sans KR", data: latin, weight: 700 as const, style: "normal" as const },
  ];
}

function Chip({ n, label }: { n: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#ffffff",
        border: "2px solid #2a7a4f",
        borderRadius: 999,
        padding: "8px 22px 8px 10px",
        marginRight: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          marginRight: 10,
          borderRadius: 999,
          background: "#2a7a4f",
          color: "#ffffff",
          fontSize: 18,
        }}
      >
        {n}
      </div>
      <span style={{ fontSize: 22, color: "#163d28" }}>{label}</span>
    </div>
  );
}

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#eef2ef",
          padding: "64px 72px 56px",
          fontFamily: "Noto Sans KR",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              marginRight: 20,
              borderRadius: 20,
              background: "#2a7a4f",
            }}
          >
            <svg width="42" height="42" viewBox="0 0 24 24">
              <path
                fill="#ffffff"
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              />
              <circle cx="12" cy="9" r="2.6" fill="#2a7a4f" />
            </svg>
          </div>
          <span style={{ fontSize: 52, color: "#163d28", letterSpacing: -1 }}>{SITE_NAME}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 40, color: "#163d28", lineHeight: 1.35 }}>
            채식·할랄 태그를 지도에서 걸러 보는
          </span>
          <span style={{ fontSize: 40, color: "#163d28", lineHeight: 1.35 }}>공유 맛집 지도</span>
          <span style={{ marginTop: 16, fontSize: 26, color: "#5b6b63" }}>
            A shared map for vegetarian and halal tags
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex" }}>
            <Chip n="1" label="채식" />
            <Chip n="2" label="비건" />
            <Chip n="3" label="할랄" />
          </div>
          <span style={{ fontSize: 22, color: "#7a8a82" }}>동국대 · 충무로</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: await loadFonts(),
    },
  );
}
