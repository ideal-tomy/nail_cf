import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'line';
};

const variants = {
  primary: 'bg-plum text-white hover:bg-plum/90',
  secondary: 'border border-petal bg-white text-ink hover:bg-blush/60',
  ghost: 'text-plum hover:bg-blush/50',
  line: 'bg-line-green text-white hover:brightness-95',
};

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      type="button"
      className={[
        'rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50',
        variants[variant],
        className,
      ].join(' ')}
      {...props}
    />
  );
}
