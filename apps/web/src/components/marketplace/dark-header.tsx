import Link from 'next/link';
import './theme.css';

type Step = { label: string; active?: boolean; href?: string };

export function DarkHeader({
  steps = [],
  rightSlot,
  brandHref = '/',
}: {
  steps?: Step[];
  rightSlot?: React.ReactNode;
  brandHref?: string;
}) {
  return (
    <header className="vt-top">
      <Link href={brandHref as never} className="vt-brand">
        <span className="vt-seal">V</span>
        <span>
          VisaTrack<span className="vt-dotai">.AI</span>
        </span>
      </Link>
      {steps.length > 0 ? (
        <nav className="vt-steps">
          {steps.map((s, i) => (
            <span key={s.label}>
              <span className={s.active ? 'active' : ''}>{s.label}</span>
              {i < steps.length - 1 ? <span className="sep" style={{ marginLeft: 14 }}>/</span> : null}
            </span>
          ))}
        </nav>
      ) : null}
      {rightSlot ? <div>{rightSlot}</div> : null}
    </header>
  );
}
