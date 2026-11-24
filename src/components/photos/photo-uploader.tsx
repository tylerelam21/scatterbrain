"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { addPhotoToCollection, uploadPhotoFile } from "@/server/actions/photos";

interface PhotoUploaderProps {
  collectionSlug?: string;
  collectionId?: string;
}

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

// PRD §26 — drag/drop, file picker, multiple uploads, automatic dimension
// extraction. Each file is sent to our own server (uploadPhotoFile), which
// does the R2 PUT itself — no direct browser-to-R2 request, so no bucket
// CORS policy to get right.
export function PhotoUploader({ collectionSlug, collectionId }: PhotoUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function uploadFiles(files: FileList | File[]) {
    setStatus("uploading");
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        const { width, height } = await readImageDimensions(file);

        const formData = new FormData();
        formData.set("file", file);
        formData.set("width", String(width));
        formData.set("height", String(height));
        const photo = await uploadPhotoFile(formData);

        if (collectionId && photo) {
          const formData = new FormData();
          formData.set("photoId", photo.id);
          await addPhotoToCollection(collectionSlug ?? "", collectionId, formData);
        }
      }
      setStatus("idle");
      setErrorMessage(null);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something failed. Try again.");
    }
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files.length) uploadFiles(event.dataTransfer.files);
      }}
      className={`rounded border border-dashed px-6 py-4 text-center text-sm transition-colors ${
        isDragging ? "border-accent text-accent" : "border-border text-muted"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => event.target.files && uploadFiles(event.target.files)}
      />
      {status === "uploading" ? (
        "Uploading…"
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className="hover:text-ink">
          Drop photos here, or click to choose
        </button>
      )}
      {status === "error" && <p className="mt-1 text-accent">{errorMessage ?? "Something failed. Try again."}</p>}
    </div>
  );
}
