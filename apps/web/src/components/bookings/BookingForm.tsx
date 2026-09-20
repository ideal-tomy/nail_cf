import { useEffect, useState } from 'react';
import { createCustomer, listCustomers } from '../../lib/api';
import { localDatetimeToIso, nowLocalDatetimeValue, toLocalDatetimeValue } from '../../lib/dates';
import type { Booking, Customer } from '../../lib/types';
import { Button } from '../ui/Button';
import { Field, inputClass } from '../ui/Field';

type Props = {
  initial?: Booking;
  fixedCustomerId?: string;
  defaultStartsAt?: string;
  allowNewCustomer?: boolean;
  onSubmit: (input: {
    customerId: string;
    startsAt: string;
    durationMin: number;
    menu?: string;
    note?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

type CustomerMode = 'existing' | 'new';

export function BookingForm({
  initial,
  fixedCustomerId,
  defaultStartsAt,
  allowNewCustomer = false,
  onSubmit,
  onCancel,
}: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerMode, setCustomerMode] = useState<CustomerMode>('existing');
  const [customerId, setCustomerId] = useState(fixedCustomerId ?? initial?.customerId ?? '');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [startsAt, setStartsAt] = useState(
    initial ? toLocalDatetimeValue(initial.startsAt) : (defaultStartsAt ?? nowLocalDatetimeValue()),
  );
  const [durationMin, setDurationMin] = useState('60');
  const [menu, setMenu] = useState(initial?.menu ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRegisterNewCustomer = allowNewCustomer && !fixedCustomerId && !initial;

  useEffect(() => {
    listCustomers()
      .then(setCustomers)
      .catch(() => setCustomers([]));
  }, []);

  useEffect(() => {
    if (initial) {
      setCustomerId(initial.customerId ?? '');
      setStartsAt(toLocalDatetimeValue(initial.startsAt));
      setMenu(initial.menu ?? '');
      setNote(initial.note ?? '');
      const start = new Date(initial.startsAt).getTime();
      const end = new Date(initial.endsAt).getTime();
      const mins = Math.round((end - start) / 60_000);
      if (mins > 0) setDurationMin(String(mins));
    }
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let resolvedCustomerId = customerId;
    if (canRegisterNewCustomer && customerMode === 'new') {
      const name = newCustomerName.trim();
      if (!name) {
        setError('新規顧客のお名前を入力してください');
        return;
      }
    } else if (!resolvedCustomerId) {
      setError('顧客を選択してください');
      return;
    }

    const duration = Number(durationMin);
    if (!Number.isFinite(duration) || duration < 15) {
      setError('施術時間は15分以上で入力してください');
      return;
    }

    setSaving(true);
    try {
      if (canRegisterNewCustomer && customerMode === 'new') {
        const customer = await createCustomer({
          name: newCustomerName.trim(),
          phone: newCustomerPhone.trim() || undefined,
        });
        resolvedCustomerId = customer.id;
      }

      await onSubmit({
        customerId: resolvedCustomerId,
        startsAt: localDatetimeToIso(startsAt),
        durationMin: duration,
        menu: menu.trim() || undefined,
        note: note.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!fixedCustomerId && (
        <Field label="顧客 *">
          {canRegisterNewCustomer && (
            <div className="mb-2 flex gap-2">
              <button
                type="button"
                onClick={() => setCustomerMode('existing')}
                className={[
                  'flex-1 rounded-full border px-3 py-2 text-sm font-semibold',
                  customerMode === 'existing'
                    ? 'border-plum bg-plum text-white'
                    : 'border-petal bg-card text-mauve',
                ].join(' ')}
              >
                登録済み
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('new')}
                className={[
                  'flex-1 rounded-full border px-3 py-2 text-sm font-semibold',
                  customerMode === 'new'
                    ? 'border-plum bg-plum text-white'
                    : 'border-petal bg-card text-mauve',
                ].join(' ')}
              >
                新規登録
              </button>
            </div>
          )}

          {canRegisterNewCustomer && customerMode === 'new' ? (
            <div className="space-y-3 rounded-xl border border-petal bg-blush/30 p-3">
              <Field label="お名前 *">
                <input
                  className={inputClass}
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="例: 田中 ゆい"
                  required
                />
              </Field>
              <Field label="連絡先">
                <input
                  className={inputClass}
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="090-xxxx / LINE など"
                />
              </Field>
            </div>
          ) : (
            <select
              className={inputClass}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">選択してください</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      )}

      <Field label="日時 *">
        <input
          className={inputClass}
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          required
        />
      </Field>

      <Field label="施術時間（分）">
        <input
          className={inputClass}
          type="number"
          min={15}
          max={480}
          step={15}
          value={durationMin}
          onChange={(e) => setDurationMin(e.target.value)}
        />
      </Field>

      <Field label="メニュー">
        <input className={inputClass} value={menu} onChange={(e) => setMenu(e.target.value)} />
      </Field>

      <Field label="メモ">
        <textarea className={`${inputClass} min-h-20`} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      {error && <p className="text-sm text-plum">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? '保存中…' : initial ? '更新する' : '予約を追加'}
        </Button>
      </div>
    </form>
  );
}
