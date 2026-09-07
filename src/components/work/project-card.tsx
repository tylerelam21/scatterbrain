import Link from "next/link";

interface ProjectCardProps {
  slug: string;
  title: string;
  tagline: string | null;
  status: string;
  featured: boolean;
  visibility: string;
  isOwner: boolean;
  isLab?: boolean;
}

export function ProjectCard({
  slug,
  title,
  tagline,
  status,
  featured,
  visibility,
  isOwner,
  isLab,
}: ProjectCardProps) {
  return (
    <Link href={`/work/${slug}`} className="block py-5">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-lg text-ink">
          {title}
          {featured && <span className="ml-2 text-accent">★</span>}
          {isLab && (
            <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[10px] tracking-wide text-muted uppercase">
              Lab
            </span>
          )}
        </span>
        <span className="shrink-0 text-xs text-muted">
          {status}
          {isOwner && visibility !== "PUBLIC" && ` · ${visibility}`}
        </span>
      </div>
      {tagline && <p className="mt-1 text-sm text-muted">{tagline}</p>}
    </Link>
  );
}
