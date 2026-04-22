import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthSplitLayoutProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  quoteTitle?: string;
  quoteText?: string;
  backTo?: string;
  backLabel?: string;
  reverse?: boolean;
  children: ReactNode;
}

export default function AuthSplitLayout({
  title,
  description,
  imageUrl,
  imageAlt,
  quoteTitle = 'QuickBite',
  quoteText,
  backTo,
  backLabel,
  reverse = false,
  children,
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)]">
      <div className={`flex min-h-screen flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
        <section className="relative flex w-full items-center justify-center px-6 py-12 md:px-10 lg:w-1/2 lg:px-16 lg:py-16 xl:px-24">
          {backTo && backLabel ? (
            <Link
              to={backTo}
              className="absolute left-6 top-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)] transition hover:text-[var(--color-primary)] md:left-10 md:top-8"
            >
              {backLabel}
            </Link>
          ) : null}

          <div className="w-full max-w-md rounded-[2rem] bg-[var(--color-surface-container-lowest)] p-8 shadow-[0_32px_60px_rgba(29,27,27,0.07)] md:p-10">
            <Link to="/" className="font-display text-3xl font-black italic tracking-tight text-[var(--color-primary)]">
              QuickBite
            </Link>
            <div className="mt-8">
              <h1 className="font-display text-4xl font-black tracking-[-0.04em] md:text-5xl">{title}</h1>
              <p className="mt-3 text-base leading-7 text-[var(--color-on-surface-variant)]">{description}</p>
            </div>
            <div className="mt-8">{children}</div>
          </div>
        </section>

        <section className="relative hidden min-h-[40rem] overflow-hidden bg-[var(--color-surface-container-low)] lg:block lg:w-1/2">
          <img src={imageUrl} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(29,27,27,0.08)_0%,rgba(29,27,27,0.52)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,90,95,0.34),transparent_30%)]" />
          <div className="absolute bottom-16 left-16 right-16 max-w-xl text-white">
            <p className="font-display text-5xl font-black italic tracking-tight">{quoteTitle}</p>
            {quoteText ? <p className="mt-4 text-xl leading-8 text-white/86">{quoteText}</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
