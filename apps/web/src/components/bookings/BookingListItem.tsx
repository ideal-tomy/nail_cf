import { Link } from 'react-router-dom';
import { formatTime } from '../../lib/dates';
import type { Booking } from '../../lib/types';
import { Button } from '../ui/Button';

type Props = {
  booking: Booking;
  onEdit: () => void;
  onCancel: () => void;
};

export function BookingListItem({ booking, onEdit, onCancel }: Props) {
  const canceled = booking.status === 'canceled';

  return (
    <div className={`rounded-2xl bg-card p-4 shadow-sm ${canceled ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-bold text-ink">{formatTime(booking.startsAt)}</p>
          {booking.customerId ? (
            <Link to={`/customers/${booking.customerId}`} className="text-[15px] font-semibold text-plum">
              {booking.customerName ?? '（名前なし）'}
            </Link>
          ) : (
            <p className="text-[15px] font-semibold text-ink">{booking.customerName ?? '（顧客未設定）'}</p>
          )}
          {booking.menu && <p className="mt-1 text-sm text-mauve">{booking.menu}</p>}
          {booking.note && <p className="mt-1 text-sm text-mauve">{booking.note}</p>}
          {canceled && <p className="mt-1 text-xs font-semibold text-mauve">キャンセル済み</p>}
        </div>
      </div>

      {!canceled && booking.status === 'reserved' && (
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" className="flex-1 text-xs" onClick={onEdit}>
            編集
          </Button>
          <Button variant="ghost" className="flex-1 text-xs" onClick={onCancel}>
            取消
          </Button>
        </div>
      )}
    </div>
  );
}
