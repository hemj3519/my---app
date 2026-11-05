import type { ErrorCode } from "@/types/result";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_DIM = 1024;

function resolveType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return map[ext] ?? "";
}

export function validateImage(
  file: File
): { ok: true } | { ok: false; error: ErrorCode } {
  if (!ACCEPTED_TYPES.includes(resolveType(file))) {
    return { ok: false, error: "FORMAT" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "SIZE" };
  }
  return { ok: true };
}

export function resizeToJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, MAX_DIM / Math.max(w, h));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Returns base64 string without the data:image/jpeg;base64, prefix
      resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("cannot read image"));
    };

    img.src = url;
  });
}
