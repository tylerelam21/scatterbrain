import { InlineEditable } from "./inline-editable";
import { setSiteContentField } from "@/server/actions/site";

interface SiteFooterProps {
  bio: string;
  email: string;
  linkedin: string;
  github: string;
  editable: boolean;
}

// The final note at the bottom of the site — personal, not corporate.
// Bio line and the contact links are all owner-editable (Settings →
// Homepage, or inline here); simply absent when unset for anyone else,
// rather than shown as placeholder text or dead links.
export function SiteFooter({ bio, email, linkedin, github, editable }: SiteFooterProps) {
  return (
    <footer className="mt-24 border-t border-border py-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm text-ink">Made in Atlanta, GA.</p>
          {(bio || editable) && (
            <InlineEditable
              value={bio}
              editable={editable}
              onSave={setSiteContentField.bind(null, "home.footerBio")}
              placeholder="A short line under 'Made in Atlanta, GA.'"
              className="mt-1 text-sm text-muted"
            />
          )}
        </div>

        <div className="flex items-center gap-5 text-sm">
          {email && (
            <a
              href={`mailto:${email}`}
              className="text-ink underline decoration-1 underline-offset-4 hover:text-accent"
            >
              Say hello ↗
            </a>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ink">
              LinkedIn
            </a>
          )}
          {github && (
            <a href={github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ink">
              GitHub
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
