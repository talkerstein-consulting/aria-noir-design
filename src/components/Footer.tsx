export default function Footer() {
  return (
    <footer className="border-t border-gold-soft/40 bg-noir px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-gold/70">
          Aria Noir
        </span>
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[11px] uppercase tracking-[0.25em] text-cream/40">
          <span className="cursor-pointer hover:text-cream/70">Journal</span>
          <span className="cursor-pointer hover:text-cream/70">Materials</span>
          <span className="cursor-pointer hover:text-cream/70">Fit</span>
          <span className="cursor-pointer hover:text-cream/70">Contact</span>
        </nav>
        <p className="text-[10px] tracking-[0.2em] text-cream/25">
          © {new Date().getFullYear()} Aria Noir
        </p>
      </div>
    </footer>
  );
}
