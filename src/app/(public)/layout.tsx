// PRD §1, §7 — public routes are reachable by anyone; each page filters
// content by visibility itself (owner sees everything, visitors see PUBLIC
// only) rather than being gated at the layout level.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
