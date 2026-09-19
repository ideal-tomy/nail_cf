import type { ReactNode } from 'react';

type Props = {
  label: string;
  children: ReactNode;
  hint?: string;
};

export function Field({ label, children, hint }: Props) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-mauve">{label}</span>
      {children}
      {hint && <span className="block text-xs text-mauve/80">{hint}</span>}
    </label>
  );
}

export const inputClass =
  'w-full rounded-xl border border-petal bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-plum';
