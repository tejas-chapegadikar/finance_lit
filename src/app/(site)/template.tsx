// Each public page eases in, like the signed-in ones.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
