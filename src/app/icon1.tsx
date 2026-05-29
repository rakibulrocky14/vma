import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon192() {
  const logoBuffer = fs.readFileSync(
    path.join(process.cwd(), "public", "logo.png")
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={size.width}
          height={size.height}
          alt="VMA"
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
