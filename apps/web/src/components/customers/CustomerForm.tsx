import { useState } from 'react';
import { Button } from '../ui/Button';
import { Field, inputClass } from '../ui/Field';
import type { CustomerInput } from '../../lib/types';

type Props = {
  initial?: Partial<CustomerInput>;
  submitLabel: string;
  onSubmit: (input: CustomerInput) => Promise<void>;
  onCancel?: () => void;
};

export function CustomerForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [lineName, setLineName] = useState(initial?.lineName ?? '');
  const [preference, setPreference] = useState(initial?.preference ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [intervalDays, setIntervalDays] = useState(String(initial?.contactIntervalDays ?? 28));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim() || undefined,
        lineName: lineName.trim() || undefined,
        preference: preference.trim() || undefined,
        note: note.trim() || undefined,
        contactIntervalDays: Number(intervalDays) || 28,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field label="お名前 *">
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Field>

      <Field label="連絡先">
        <input
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="090-xxxx / LINE など"
        />
      </Field>

      <Field label="LINE 表示名メモ">
        <input className={inputClass} value={lineName} onChange={(e) => setLineName(e.target.value)} />
      </Field>

      <Field label="好み・デザイン傾向">
        <input className={inputClass} value={preference} onChange={(e) => setPreference(e.target.value)} />
      </Field>

      <Field label="サロンメモ">
        <textarea
          className={`${inputClass} min-h-24`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>

      <Field label="連絡周期（日）" hint="7〜365。初期値 28">
        <input
          className={inputClass}
          type="number"
          min={7}
          max={365}
          value={intervalDays}
          onChange={(e) => setIntervalDays(e.target.value)}
        />
      </Field>

      {error && <p className="text-sm text-plum">{error}</p>}

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={saving || !name.trim()}>
          {saving ? '保存中…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
