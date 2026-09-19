export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--ml-border)',
      backgroundColor: 'var(--ml-surface)',
    }}>
      <div style={{
        maxWidth: '1080px', margin: '0 auto',
        paddingInline: '1.5rem', paddingBlock: '1.125rem',
      }}>
        <p style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: '0.8rem', color: 'var(--ml-muted)', margin: 0,
        }}>
          &copy; 2026 MorrisLabs
        </p>
      </div>
    </footer>
  );
}
