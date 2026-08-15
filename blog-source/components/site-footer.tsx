export function SiteFooter() {
  return (
    <footer
      className="border-t px-7 py-8 text-center text-sm text-[var(--fg-muted)] md:px-9"
      style={{ borderColor: "var(--line)" }}
    >
      <span>Larielo Lab © 2026</span>
      <span className="mx-2">·</span>
      <a className="hover:text-[var(--fg)]" href="#">
        Terms of service
      </a>
      <span className="mx-2">·</span>
      <a className="hover:text-[var(--fg)]" href="#">
        Privacy notice
      </a>
    </footer>
  );
}
