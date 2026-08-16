import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2a7a4f",
        }}
      >
        <svg width="118" height="118" viewBox="0 0 24 24">
          <path
            fill="#ffffff"
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          />
          <circle cx="12" cy="9" r="2.6" fill="#2a7a4f" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
