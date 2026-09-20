import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  backTo: string;
  backLabel: string;
  title: string;
  action?: ReactNode;
};

export function SubPageHeader({ backTo, backLabel, title, action }: Props) {
  return (
    <div className="space-y-2">
      <Link
        to={backTo}
        className="inline-flex min-h-10 items-center gap-1 rounded-lg px-1 text-sm font-semibold text-plum active:bg-blush"
      >
        <span aria-hidden>←</span>
        {backLabel}
      </Link>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        {action}
      </div>
    </div>
  );
}
