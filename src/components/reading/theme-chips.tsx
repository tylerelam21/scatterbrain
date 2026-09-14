import { addUserTheme, removeTheme } from "@/server/actions/reading";

interface ThemeChipsProps {
  entryId: string;
  themes: { id: string; name: string; source: "USER" | "AI" }[];
}

// AI-identified vs. user-added themes stay visually distinct (a dashed vs.
// solid border) so it's always clear which is which — never silently
// merged, per the brief's AI/Mine boundary rule.
export function ThemeChips({ entryId, themes }: ThemeChipsProps) {
  return (
    <div>
      <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Themes Identified</h2>

      {themes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {themes.map((theme) => (
            <form key={theme.id} action={removeTheme.bind(null, entryId, theme.id)}>
              <button
                type="submit"
                title={theme.source === "AI" ? "Identified by AI" : "Added by you"}
                className={`rounded-full px-3 py-1 text-xs text-ink hover:text-accent ${
                  theme.source === "AI" ? "border border-dashed border-border" : "border border-border"
                }`}
              >
                {theme.name} ×
              </button>
            </form>
          ))}
        </div>
      )}

      <form action={addUserTheme.bind(null, entryId)} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          name="name"
          placeholder="Add a theme"
          autoComplete="off"
          className="w-32 border-b border-border bg-transparent py-1 text-xs text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
        <button type="submit" className="text-xs text-muted hover:text-ink">
          Add
        </button>
      </form>
    </div>
  );
}
