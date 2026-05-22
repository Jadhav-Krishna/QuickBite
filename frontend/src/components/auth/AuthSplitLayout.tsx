import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className={`flex min-h-screen flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
        {/* Left Side - Form Section */}
        <section className="relative flex w-full items-center justify-center px-6 py-12 md:px-10 lg:w-1/2 lg:px-16 lg:py-16 xl:px-24">
          {backTo && backLabel ? (
            <Link
              to={backTo}
              className="absolute left-6 top-6 text-sm font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:text-[var(--color-primary)] md:left-10 md:top-8"
            >
              {backLabel}
            </Link>
          ) : null}

          <div className="w-full max-w-md space-y-8 animate-fade-up">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-rose-600 shadow-lg shadow-rose-500/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <Link to="/" className="font-display text-3xl font-black italic tracking-tight text-[var(--color-primary)]">
                QuickBite
              </Link>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h1 className="font-display text-4xl font-black tracking-[-0.04em] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent md:text-5xl">
                {title}
              </h1>
              <p className="text-base leading-7 text-slate-600 font-medium">{description}</p>
            </div>

            {/* Form Content */}
            <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              {children}
            </div>
          </div>
        </section>

        {/* Right Side - Hero Image */}
        <section className="relative hidden min-h-[40rem] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 lg:block lg:w-1/2">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={imageUrl} 
              alt={imageAlt} 
              className="h-full w-full object-cover opacity-30" 
            />
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 via-transparent to-transparent" />

          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-16 text-white">
            <div className="space-y-6 max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-bold border border-white/20">
                <Sparkles className="h-4 w-4" />
                Premium Food Delivery
              </div>

              {/* Quote */}
              <div className="space-y-4">
                <p className="font-display text-5xl font-black italic tracking-tight leading-tight">
                  {quoteTitle}
                </p>
                {quoteText ? (
                  <p className="text-xl leading-8 text-slate-300 font-medium">
                    {quoteText}
                  </p>
                ) : null}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl font-black">10K+</div>
                  <div className="text-sm text-slate-400 font-semibold">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-black">500+</div>
                  <div className="text-sm text-slate-400 font-semibold">Restaurants</div>
                </div>
                <div>
                  <div className="text-3xl font-black">4.9★</div>
                  <div className="text-sm text-slate-400 font-semibold">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
