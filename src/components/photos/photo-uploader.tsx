"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { addPhotoToCollection, createPhoto, requestPhotoUpload } from "@/server/actions/photos";

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
// extraction. The file goes straight to R2 via a presigned PUT; our server
// only ever sees the resulting metadata.
export function PhotoUploader({ collectionSlug, collectionId }: PhotoUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [isDragging, setIsDragging] = useState(false);

  async function uploadFiles(files: FileList | File[]) {
    setStatus("uploading");
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        const { width, height } = await readImageDimensions(file);
        const { storageKey, uploadUrl } = await requestPhotoUpload(file.name, file.type);

        const res = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!res.ok) throw new Error("Upload failed");

        const photo = await createPhoto({
          storageKey,
          originalFilename: file.name,
          width,
          height,
        });

        if (collectionId && photo) {
          const formData = new FormData();
          formData.set("photoId", photo.id);
          await addPhotoToCollection(collectionSlug ?? "", collectionId, formData);
        }
      }
      setStatus("idle");
      router.refresh();
    } catch {
      setStatus("error");
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
      {status === "error" && <p className="mt-1 text-accent">Something failed. Try again.</p>}
    </div>
  );
}
