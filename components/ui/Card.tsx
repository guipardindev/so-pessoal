import type { ReactNode } from "react";

interface CardProps {
  id: string;
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ id, title, eyebrow, actions, children, className = "" }: CardProps) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`rounded-2xl border border-border bg-surface p-5 sm:p-6 ${className}`}
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              {eyebrow}
            </p>
          )}
          <h2 id={headingId} className="font-display text-xl font-semibold tracking-tight">
            {title}
          </h2>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      {children}
    </section>
  );
}
