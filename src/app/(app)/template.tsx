// Re-mounts on every move between sections, so each page eases in. CSS only;
// reduced motion turns it off (globals.css).
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
