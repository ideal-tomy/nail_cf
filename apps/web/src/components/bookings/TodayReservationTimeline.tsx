import { Link } from 'react-router-dom';
import { formatTime } from '../../lib/dates';
import type { Booking } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';

type Props = {
  bookings: Booking[];
  loading?: boolean;
};

export function TodayReservationTimeline({ bookings, loading }: Props) {
  if (loading) {
    return <p className="text-sm text-mauve">読み込み中…</p>;
  }

  if (bookings.length === 0) {
    return (
      <div className="space-y-3">
        <EmptyState title="今日は予定がありません" />
        <Link to="/bookings" className="inline-block text-sm font-semibold text-plum">
          予約を追加 →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
      {bookings.map((booking, index) => {
        const isLast = index === bookings.length - 1;
        const content = (
          <>
            <div className="w-[52px] shrink-0 text-base font-bold text-ink">
              {formatTime(booking.startsAt)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-ink">
                {booking.customerName ?? '（顧客未設定）'}
              </p>
              {booking.menu && (
                <p className="mt-0.5 line-clamp-1 text-[13px] text-mauve">{booking.menu}</p>
              )}
            </div>
          </>
        );

        const className = `flex items-center gap-3 px-3.5 py-3 transition active:bg-blush ${
          isLast ? '' : 'border-b border-petal'
        }`;

        if (booking.customerId) {
          return (
            <Link
              key={booking.id}
              to={`/customers/${booking.customerId}`}
              className={className}
            >
              {content}
            </Link>
          );
        }

        return (
          <div key={booking.id} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
