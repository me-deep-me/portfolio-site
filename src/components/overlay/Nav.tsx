'use client';

import { useEffect, useRef } from 'react';
import { useSceneStore } from '@/store/sceneStore';

const NAV_LINKS = [
  { href: '#about',    label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact',  label: 'Contact' },
];

export function Nav() {
  const navRef        = useRef<HTMLElement>(null);
  const scrollProgress = useSceneStore((s) => s.scrollProgress);

  // Fade nav slightly as user scrolls (glassmorphism stays, opacity of text dims)
  useEffect(() => {
    if (!navRef.current) return;
    const scrolled = scrollProgress > 0.02;
    navRef.current.style.borderBottomColor = scrolled
      ? 'rgba(58,143,212,0.14)'
      : 'transparent';
  }, [scrollProgress]);

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.35rem 3.5rem',
        background: 'rgba(240,244,252,0.80)',
        backdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid transparent',
        transition: 'border-color 0.4s ease',
      }}
    >
      <a
        href="#"
        style={{
          fontFamily: 'var(--fd)',
          fontSize: '1.05rem',
          color: 'var(--ink)',
          textDecoration: 'none',
          letterSpacing: '0.01em',
        }}
      >
        Mattia Erigoni
      </a>
      <ul style={{ display: 'flex', gap: '2.4rem', listStyle: 'none' }}>
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href}>
            <a
              href={href}
              style={{
                fontSize: '0.74rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ink3)',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--sky)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--ink3)')}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
