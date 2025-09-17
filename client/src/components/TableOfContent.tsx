// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: s4010989

import { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

export type TocItem = { id: string; label: string };

type Props = {
  items: TocItem[];
  activeId: string | null;
  onClick?: (id: string) => void;
};

export default function Toc({ items, activeId, onClick }: Props) {
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // keep active item visible if TOC is scrollable
    const active = navRef.current?.querySelector<HTMLAnchorElement>(
      `a[data-id="${activeId}"]`,
    );
    active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeId]);

  return (
    <nav
      ref={navRef}
      aria-label="On this page"
      className="sticky top-24 max-h-[70vh] overflow-auto pr-4 text-sm"
    >
      <div className="mb-3 font-medium text-neutral-500">On this page</div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              data-id={it.id}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(it.id)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                onClick?.(it.id);
              }}
              className={cn(
                'block border-l pl-3 hover:text-neutral-900',
                activeId === it.id
                  ? 'text-neutral-900 border-neutral-900'
                  : 'text-neutral-500 border-transparent',
              )}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
