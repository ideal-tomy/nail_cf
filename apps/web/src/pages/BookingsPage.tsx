import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBooking, listBookings, updateBooking } from '../lib/api';
import {
  formatDateLabel,
  getWeekRange,
  todayDateKey,
  toDateKey,
} from '../lib/dates';
import type { Booking } from '../lib/types';
import { WeekScheduleStrip } from '../components/bookings/WeekScheduleStrip';
import { BookingListItem } from '../components/bookings/BookingListItem';
import { BookingForm } from '../components/bookings/BookingForm';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

export function BookingsPage() {
  const [selectedDate, setSelectedDate] = useState(todayDateKey());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const { showToast } = useToast();

  const weekRange = useMemo(() => getWeekRange(), []);

  const reload = useCallback(async () => {
    const rows = await listBookings(weekRange.start, weekRange.end);
    setBookings(rows);
  }, [weekRange.end, weekRange.start]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reload()
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '読み込みに失敗しました');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const dayBookings = useMemo(() => {
    const onDay = bookings.filter((b) => toDateKey(b.startsAt) === selectedDate);
    return {
      active: onDay.filter((b) => b.status === 'reserved'),
      canceled: onDay.filter((b) => b.status === 'canceled'),
      done: onDay.filter((b) => b.status === 'done'),
    };
  }, [bookings, selectedDate]);

  const defaultStartsAt = `${selectedDate}T10:00`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">予約</h2>
        <Button onClick={() => setShowCreate(true)}>追加</Button>
      </div>

      <WeekScheduleStrip
        bookings={bookings}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <section className="space-y-3">
        <p className="text-[13px] font-bold tracking-wide text-mauve">
          {formatDateLabel(selectedDate)}
        </p>

        {loading && <p className="text-sm text-mauve">読み込み中…</p>}
        {error && <p className="text-sm text-plum">{error}</p>}

        {!loading && !error && dayBookings.active.length === 0 && dayBookings.canceled.length === 0 && (
          <EmptyState title="この日の予約はありません" description="右上の「追加」から予約を入れられます" />
        )}

        {dayBookings.active.map((booking) => (
          <BookingListItem
            key={booking.id}
            booking={booking}
            onEdit={() => setEditing(booking)}
            onCancel={async () => {
              if (!confirm('この予約を取り消しますか？')) return;
              await updateBooking(booking.id, { status: 'canceled' });
              await reload();
              showToast('予約を取り消しました');
            }}
          />
        ))}

        {dayBookings.canceled.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-mauve">キャンセル済み</p>
            {dayBookings.canceled.map((booking) => (
              <BookingListItem
                key={booking.id}
                booking={booking}
                onEdit={() => {}}
                onCancel={() => {}}
              />
            ))}
          </div>
        )}
      </section>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="予約を追加">
        <BookingForm
          allowNewCustomer
          defaultStartsAt={defaultStartsAt}
          onCancel={() => setShowCreate(false)}
          onSubmit={async (input) => {
            await createBooking(input);
            await reload();
            setShowCreate(false);
            showToast('予約を追加しました');
          }}
        />
      </Modal>

      <Modal open={editing != null} onClose={() => setEditing(null)} title="予約を編集">
        {editing && (
          <BookingForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSubmit={async (input) => {
              await updateBooking(editing.id, input);
              await reload();
              setEditing(null);
              showToast('予約を更新しました');
            }}
          />
        )}
      </Modal>
    </div>
  );
}
