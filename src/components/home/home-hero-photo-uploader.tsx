"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadPhotoFile } from "@/server/actions/photos";
import { setHomeHeroPhoto, clearHomeHeroPhoto } from "@/server/actions/site";

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

// The file is sent to our own server (uploadPhotoFile), which does the R2
// PUT itself — same origin the whole way, no bucket CORS policy involved.
export function HomeHeroPhotoUploader({ currentPhotoId }: { currentPhotoId: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setStatus("uploading");
    try {
      const { width, height } = await readImageDimensions(file);

      const formData = new FormData();
      formData.set("file", file);
      formData.set("width", String(width));
      formData.set("height", String(height));
      const photo = await uploadPhotoFile(formData);
      await setHomeHeroPhoto(photo.id);

      setStatus("idle");
      setErrorMessage(null);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something failed. Try again.");
    }
  }

  return (
    <div className="mt-2 flex items-center gap-3 text-xs text-muted">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) uploadFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className="hover:text-ink"
      >
        {status === "uploading" ? "Uploading…" : currentPhotoId ? "Replace hero photo" : "Add hero photo"}
      </button>
      {currentPhotoId && (
        <button
          type="button"
          onClick={() => clearHomeHeroPhoto().then(() => router.refresh())}
          className="hover:text-ink"
        >
          Remove
        </button>
      )}
      {status === "error" && <span className="text-accent">{errorMessage}</span>}
    </div>
  );
}
