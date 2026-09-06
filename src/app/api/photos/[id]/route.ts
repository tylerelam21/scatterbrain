import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getPhotoById } from "@/lib/db/queries/photos";
import { getPresignedDownloadUrl } from "@/lib/storage/presign";

// PRD §28 — visibility enforced server-side, not by hiding a link. The R2
// bucket itself is private; this is the only path to actual photo bytes,
// and it checks visibility before ever generating a signed URL. A private
// or nonexistent photo both return a plain 404, so a guessed URL can't be
// used to confirm a private photo even exists.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await getPhotoById(id);
  if (!photo) return new NextResponse("Not found", { status: 404 });

  if (photo.visibility !== "PUBLIC") {
    const session = await auth();
    if (session?.user?.role !== "OWNER") {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  const url = await getPresignedDownloadUrl(photo.storageKey);
  return NextResponse.redirect(url);
}
