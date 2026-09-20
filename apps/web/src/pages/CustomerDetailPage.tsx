import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  createVisit,
  deleteVisit,
  getCustomer,
  listVisits,
  updateCustomer,
  updateVisit,
  uploadVisitPhotos,
} from '../lib/api';
import { formatDate, formatPrice } from '../lib/format';
import { compressForUpload } from '../lib/imageCompress';
import type { Customer, Visit } from '../lib/types';
import { CustomerForm } from '../components/customers/CustomerForm';
import { VisitForm } from '../components/visits/VisitForm';
import { VisitHistoryItem } from '../components/visits/VisitHistoryItem';
import { PhotoGallery } from '../components/visits/PhotoGallery';
import { Button } from '../components/ui/Button';
import { SubPageHeader } from '../components/ui/SubPageHeader';
import { useToast } from '../components/ui/Toast';
import { EmptyState } from '../components/ui/EmptyState';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [addingVisit, setAddingVisit] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const { showToast } = useToast();

  const reload = useCallback(async () => {
    if (!id) return;
    const [c, v] = await Promise.all([getCustomer(id), listVisits(id)]);
    setCustomer(c);
    setVisits(v);
  }, [id]);

  useEffect(() => {
    if (!id) return;
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
  }, [id, reload]);

  const latestVisit = useMemo(() => visits[0] ?? null, [visits]);

  if (!id) return null;

  if (loading) {
    return <p className="text-sm text-mauve">読み込み中…</p>;
  }

  if (error || !customer) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-plum">{error ?? '顧客が見つかりません'}</p>
        <Link to="/customers" className="text-sm font-semibold text-plum">
          一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SubPageHeader
        backTo="/customers"
        backLabel="顧客一覧"
        title={customer.name}
        action={
          <Button variant="secondary" onClick={() => setEditing((v) => !v)}>
            {editing ? '閉じる' : '編集'}
          </Button>
        }
      />

      {editing ? (
        <section className="rounded-2xl bg-card p-4 shadow-sm">
          <CustomerForm
            initial={{
              name: customer.name,
              phone: customer.phone ?? undefined,
              lineName: customer.lineName ?? undefined,
              preference: customer.preference ?? undefined,
              note: customer.note ?? undefined,
              contactIntervalDays: customer.contactIntervalDays,
            }}
            submitLabel="更新する"
            onCancel={() => setEditing(false)}
            onSubmit={async (input) => {
              const updated = await updateCustomer(id, input);
              setCustomer(updated);
              setEditing(false);
              showToast('顧客情報を更新しました');
            }}
          />
        </section>
      ) : (
        <section className="rounded-2xl bg-card p-4 shadow-sm">
          <dl className="space-y-2 text-sm">
            {customer.phone && (
              <div>
                <dt className="text-mauve">連絡先</dt>
                <dd>{customer.phone}</dd>
              </div>
            )}
            {customer.preference && (
              <div>
                <dt className="text-mauve">好み</dt>
                <dd>{customer.preference}</dd>
              </div>
            )}
            {customer.note && (
              <div>
                <dt className="text-mauve">メモ</dt>
                <dd className="whitespace-pre-wrap">{customer.note}</dd>
              </div>
            )}
            <div>
              <dt className="text-mauve">連絡周期</dt>
              <dd>{customer.contactIntervalDays} 日</dd>
            </div>
          </dl>
        </section>
      )}

      <section className="rounded-2xl bg-card p-4 shadow-sm">
        <p className="text-sm font-bold text-mauve">前回のデザイン</p>
        {latestVisit ? (
          <div className="mt-3 space-y-3">
            <div>
              <p className="font-semibold text-ink">{latestVisit.design ?? 'デザイン未入力'}</p>
              <p className="text-xs text-mauve">
                {formatDate(latestVisit.visitedOn)} · {formatPrice(latestVisit.price)}
              </p>
            </div>
            <PhotoGallery photos={latestVisit.photos} size="full" />
          </div>
        ) : (
          <p className="mt-2 text-sm text-mauve">来店履歴がまだありません</p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-mauve">来店履歴</h3>
          <Button
            variant="secondary"
            onClick={() => {
              setAddingVisit((v) => !v);
              setEditingVisitId(null);
            }}
          >
            {addingVisit ? '閉じる' : '来店を追加'}
          </Button>
        </div>

        {addingVisit && (
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <VisitForm
              onCancel={() => setAddingVisit(false)}
              onSubmit={async (input, photoFiles) => {
                const visit = await createVisit(id, input);
                for (const file of photoFiles) {
                  const { display, thumb } = await compressForUpload(file);
                  await uploadVisitPhotos(visit.id, display, thumb);
                }
                await reload();
                setAddingVisit(false);
                showToast('来店を記録しました');
              }}
            />
          </div>
        )}

        {visits.length === 0 ? (
          <EmptyState title="来店履歴がありません" description="「来店を追加」から記録できます" />
        ) : (
          <ul className="space-y-3">
            {visits.map((visit) => (
              <VisitHistoryItem
                key={visit.id}
                visit={visit}
                editing={editingVisitId === visit.id}
                onEdit={() => {
                  setEditingVisitId(visit.id);
                  setAddingVisit(false);
                }}
                onDelete={async () => {
                  if (!window.confirm('この来店履歴を削除しますか？')) return;
                  try {
                    await deleteVisit(id, visit.id);
                    await reload();
                    if (editingVisitId === visit.id) setEditingVisitId(null);
                    showToast('来店履歴を削除しました');
                  } catch (e: unknown) {
                    showToast(e instanceof Error ? e.message : '削除に失敗しました');
                  }
                }}
              >
                {editingVisitId === visit.id && (
                  <div className="mt-4 border-t border-petal pt-4">
                    <VisitForm
                      initial={visit}
                      submitLabel="更新する"
                      onCancel={() => setEditingVisitId(null)}
                      onSubmit={async (input, photoFiles) => {
                        await updateVisit(id, visit.id, input);
                        for (const file of photoFiles) {
                          const { display, thumb } = await compressForUpload(file);
                          await uploadVisitPhotos(visit.id, display, thumb);
                        }
                        await reload();
                        setEditingVisitId(null);
                        showToast('来店履歴を更新しました');
                      }}
                    />
                  </div>
                )}
              </VisitHistoryItem>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
