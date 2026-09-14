interface ItemListProps {
  heading: string;
  placeholder: string;
  items: string[];
  addAction: (formData: FormData) => void | Promise<void>;
  removeAction: (index: number) => void | Promise<void>;
}

// Shared shape for "Key Takeaways (My Own)" and "Questions I'm Wrestling
// With" — both are just the user's own short, unstyled lists, never
// touched by the AI layer (see server/actions/reading.ts).
export function ItemList({ heading, placeholder, items, addAction, removeAction }: ItemListProps) {
  return (
    <div>
      <h2 className="text-xs font-medium tracking-widest text-muted uppercase">{heading}</h2>

      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li key={index} className="group flex items-start justify-between gap-3">
              <span className="text-ink">
                <span className="mr-2 text-muted">–</span>
                {item}
              </span>
              <form action={removeAction.bind(null, index)}>
                <button
                  type="submit"
                  className="shrink-0 text-xs text-muted opacity-0 group-hover:opacity-100 hover:text-accent"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={addAction} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          name="text"
          placeholder={placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
        <button type="submit" className="text-xs text-muted hover:text-ink">
          Add
        </button>
      </form>
    </div>
  );
}
