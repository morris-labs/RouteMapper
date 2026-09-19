import { useState, useEffect, useRef } from 'react';

const APPS = [
  { key: 'routemapper',   label: 'RouteMapper',   href: '/routemapper/' },
  { key: 'weathermapper', label: 'WeatherMapper',  href: '/weathermapper/' },
];

export default function Header({ currentApp }) {
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100, height: '56px',
      backgroundColor: 'var(--ml-surface)',
      borderBottom: '1px solid var(--ml-border)',
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        maxWidth: '1080px', margin: '0 auto', paddingInline: '1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%',
      }}>
        <a
          href="/"
          style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem',
            letterSpacing: '-0.025em', color: 'var(--ml-ink)', textDecoration: 'none',
          }}
        >
          Morris<span style={{ color: 'var(--ml-accent-fg)' }}>Labs</span>
        </a>

        <nav style={{
          display: 'flex', alignItems: 'center', gap: '1.5rem',
          fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.875rem',
        }}>
          <a href="/" style={{ color: 'var(--ml-muted)', textDecoration: 'none' }}>
            Home
          </a>

          <div ref={dropRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setOpen((v) => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                color: 'var(--ml-muted)', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0,
              }}
            >
              Apps
              <span style={{ fontSize: '0.6rem', lineHeight: 1 }}>{open ? '▲' : '▼'}</span>
            </button>

            {open && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                backgroundColor: 'var(--ml-surface)',
                border: '1px solid var(--ml-border)',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                minWidth: '160px', overflow: 'hidden',
              }}>
                {APPS.map((app) => (
                  <a
                    key={app.key}
                    href={app.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'block', padding: '0.625rem 1rem',
                      color: app.key === currentApp ? 'var(--ml-accent-fg)' : 'var(--ml-ink)',
                      backgroundColor: app.key === currentApp ? 'var(--ml-accent-bg)' : 'transparent',
                      fontWeight: app.key === currentApp ? 500 : 400,
                      textDecoration: 'none', fontSize: '0.875rem',
                    }}
                  >
                    {app.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
