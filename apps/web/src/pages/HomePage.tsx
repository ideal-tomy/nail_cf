import { useCallback, useEffect, useState } from 'react';
import { fetchHome, fetchTemplates } from '../lib/api';
import type { Booking, ContactRecommendation, MessageTemplate } from '../lib/types';
import { ContactRecommendCard } from '../components/contact/ContactRecommendCard';
import { MessageEditorModal } from '../components/contact/MessageEditorModal';
import { TodayReservationTimeline } from '../components/bookings/TodayReservationTimeline';
import { EmptyState } from '../components/ui/EmptyState';

export function HomePage() {
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [recommendations, setRecommendations] = useState<ContactRecommendation[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactRecommendation | null>(null);

  const reload = useCallback(async () => {
    const [home, tpls] = await Promise.all([fetchHome(), fetchTemplates()]);
    setTodayBookings(home.todayBookings);
    setRecommendations(home.contactRecommendations);
    setTemplates(tpls);
  }, []);

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

  return (
    <div className="space-y-7">
      <section>
        <p className="mb-2 text-[13px] font-bold tracking-wide text-mauve">今日の予定</p>
        <TodayReservationTimeline bookings={todayBookings} loading={loading} />
      </section>

      <section>
        <p className="mb-2 text-[13px] font-bold tracking-wide text-mauve">
          そろそろ連絡する人
          {!loading && `（${recommendations.length}人）`}
        </p>

        {loading && <p className="text-sm text-mauve">読み込み中…</p>}
        {error && <p className="text-sm text-plum">{error}</p>}

        {!loading && !error && recommendations.length === 0 && (
          <EmptyState title="今は連絡する人はいません" />
        )}

        {!loading && !error && recommendations.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {recommendations.map((recommendation) => (
              <ContactRecommendCard
                key={recommendation.customerId}
                recommendation={recommendation}
                onCompose={setSelected}
              />
            ))}
          </div>
        )}
      </section>

      <MessageEditorModal
        open={selected != null}
        onClose={() => setSelected(null)}
        recommendation={selected}
        templates={templates}
        onContacted={() => {
          void reload();
        }}
      />
    </div>
  );
}
