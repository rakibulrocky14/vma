import fs from "node:fs";
import path from "node:path";

/**
 * Returns the company logo as a base64 data URI for embedding in PDFs.
 * Reads straight from disk (no network) so it always renders server-side.
 * Prefers an admin-uploaded logo, falls back to the baked-in /logo.png.
 */
export function getLogoDataUri(settingsLogoUrl?: string | null): string | null {
  const candidates: string[] = [];
  if (settingsLogoUrl && settingsLogoUrl.startsWith("/")) {
    candidates.push(path.join(process.cwd(), "public", settingsLogoUrl.replace(/^\//, "")));
  }
  candidates.push(path.join(process.cwd(), "public", "logo.png"));

  for (const filePath of candidates) {
    try {
      if (!fs.existsSync(filePath)) continue;
      const buf = fs.readFileSync(filePath);
      const ext = path.extname(filePath).slice(1).toLowerCase();
      const mime =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "webp"
            ? "image/webp"
            : "image/png";
      return `data:${mime};base64,${buf.toString("base64")}`;
    } catch {
      // try next candidate
    }
  }
  return null;
}
