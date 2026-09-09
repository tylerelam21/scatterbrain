import { DoorMark } from "@/components/brand/door-mark";
import { InlineEditable } from "./inline-editable";
import { setSiteContentField } from "@/server/actions/site";

interface SiteFooterProps {
  bio: string;
  email: string;
  linkedin: string;
  github: string;
  editable: boolean;
}

// The final handwritten note at the bottom of the letter — personal, not
// corporate. Bio line and the three contact links are all owner-editable
// (Settings → Homepage, or inline here); simply absent when unset for
// anyone else, rather than shown as placeholder text or dead links.
export function SiteFooter({ bio, email, linkedin, github, editable }: SiteFooterProps) {
  const hasLinks = email || linkedin || github;

  return (
    <footer className="mt-24 border-t border-border py-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <DoorMark aria-hidden className="h-6 w-auto text-ink" />
          <p className="mt-4 text-sm text-ink">Currently in Atlanta, Georgia.</p>
          {(bio || editable) && (
            <InlineEditable
              value={bio}
              editable={editable}
              onSave={setSiteContentField.bind(null, "home.footerBio")}
              placeholder="A sentence under 'Currently in Atlanta, Georgia.'"
              className="mt-1 text-sm text-muted"
            />
          )}
        </div>

        {hasLinks && (
          <div className="flex gap-5 text-sm text-muted">
            {email && (
              <a href={`mailto:${email}`} className="hover:text-ink">
                Email
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                LinkedIn
              </a>
            )}
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
