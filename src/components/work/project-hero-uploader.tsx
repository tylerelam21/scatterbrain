"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadPhotoFile } from "@/server/actions/photos";
import { setProjectHeroImage, clearProjectHeroImage } from "@/server/actions/work";

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

interface ProjectHeroUploaderProps {
  projectId: string;
  slug: string;
  currentHeroImageId: string | null;
}

// The cover photo shown on this project's Featured Work spread on the
// public homepage (and its own page). The file is sent to our own server
// (uploadPhotoFile), which does the R2 PUT itself, then attached via
// setProjectHeroImage rather than added to a collection.
export function ProjectHeroUploader({ projectId, slug, currentHeroImageId }: ProjectHeroUploaderProps) {
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
      await setProjectHeroImage(projectId, slug, photo.id);

      setStatus("idle");
      setErrorMessage(null);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something failed. Try again.");
    }
  }

  return (
    <div>
      <span className="text-xs text-muted">Cover image</span>
      <div className="mt-2 flex items-center gap-4">
        {currentHeroImageId && (
          // eslint-disable-next-line @next/next/no-img-element -- authorized, dynamically-owned photo served through /api/photos/[id], not a static asset next/image can optimize at build time
          <img
            src={`/api/photos/${currentHeroImageId}`}
            alt=""
            className="h-16 w-24 rounded object-cover"
          />
        )}
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
          className="rounded-full border border-border px-4 py-1.5 text-xs text-muted hover:text-ink"
        >
          {status === "uploading" ? "Uploading…" : currentHeroImageId ? "Replace" : "Upload"}
        </button>
        {currentHeroImageId && (
          <button
            type="button"
            onClick={() =>
              clearProjectHeroImage(projectId, slug).then(() => router.refresh())
            }
            className="text-xs text-muted hover:text-ink"
          >
            Remove
          </button>
        )}
      </div>
      {status === "error" && <p className="mt-1 text-xs text-accent">{errorMessage}</p>}
    </div>
  );
}
