import { useMemo } from 'react';
import { getWeekRange, todayDateKey, toDateKey } from '../../lib/dates';
import type { Booking } from '../../lib/types';

type Props = {
  bookings: Booking[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  weekAnchor?: Date;
};

export function WeekScheduleStrip({
  bookings,
  selectedDate,
  onSelectDate,
  weekAnchor,
}: Props) {
  const todayKey = todayDateKey();
  const { days } = useMemo(() => getWeekRange(weekAnchor ?? new Date()), [weekAnchor]);

  const countsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const booking of bookings) {
      if (booking.status !== 'reserved') continue;
      const key = toDateKey(booking.startsAt);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [bookings]);

  return (
    <div className="rounded-2xl bg-card px-1.5 py-2.5 shadow-sm">
      <div className="flex">
        {days.map(({ dateKey, day, weekday }) => {
          const count = countsByDate.get(dateKey) ?? 0;
          const isOn = dateKey === selectedDate;
          const isToday = dateKey === todayKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={[
                'flex flex-1 flex-col items-center rounded-[10px] py-1.5 transition',
                isOn ? 'bg-plum text-white' : 'text-ink',
              ].join(' ')}
            >
              <span className={`text-[11px] ${isOn ? 'text-white' : 'text-mauve'}`}>
                {weekday}
              </span>
              <span className="text-base font-bold">{day}</span>
              {(count > 0 || isToday) && (
                <span
                  className={[
                    'mt-0.5 h-1.5 w-1.5 rounded-full',
                    count > 0 ? (isOn ? 'bg-white' : 'bg-plum') : 'bg-petal',
                  ].join(' ')}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
