import type { ButtonHTMLAttributes, ReactNode } from 'react';

type KioskButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  active?: boolean;
  tone?: 'primary' | 'quiet' | 'danger';
};

export function KioskButton({ icon, active = false, tone = 'quiet', className = '', children, ...props }: KioskButtonProps) {
  return (
    <button
      {...props}
      className={[
        'touch-feedback inline-flex min-h-14 items-center justify-center gap-3 rounded-lg px-5 py-3 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-45',
        tone === 'primary' ? 'bg-gold text-ink shadow-glow' : '',
        tone === 'quiet' ? 'border border-white/10 bg-white/10 text-pearl hover:bg-white/15' : '',
        tone === 'danger' ? 'border border-coral/35 bg-coral/15 text-pearl hover:bg-coral/25' : '',
        active ? 'ring-2 ring-gold/60' : '',
        className
      ].join(' ')}
    >
      {icon}
      {children}
    </button>
  );
}
