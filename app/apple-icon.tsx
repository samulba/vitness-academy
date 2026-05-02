import { ImageResponse } from "next/og";

export const runtime = "edge";
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
          background: "#b50f5f",
          color: "white",
          fontSize: 92,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        VA
      </div>
    ),
    size,
  );
}
