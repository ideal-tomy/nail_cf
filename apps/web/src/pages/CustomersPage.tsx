import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCustomers } from '../lib/api';
import type { Customer } from '../lib/types';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export function CustomersPage() {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listCustomers(query)
      .then((rows) => {
        if (!cancelled) setCustomers(rows);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '読み込みに失敗しました');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">顧客一覧</h2>
        <Link to="/customers/new">
          <Button>新規</Button>
        </Link>
      </div>

      <input
        className="w-full rounded-xl border border-petal bg-white px-3 py-2.5 text-sm outline-none focus:border-plum"
        placeholder="名前で検索"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className="text-sm text-mauve">読み込み中…</p>}
      {error && <p className="text-sm text-plum">{error}</p>}

      {!loading && !error && customers.length === 0 && (
        <EmptyState
          title="該当する顧客がいません"
          description={query ? '検索条件を変えてみてください' : '右上の「新規」から登録できます'}
        />
      )}

      <ul className="space-y-2">
        {customers.map((customer) => (
          <li key={customer.id}>
            <Link
              to={`/customers/${customer.id}`}
              className="block rounded-2xl bg-card px-4 py-3 shadow-sm transition hover:bg-blush/30"
            >
              <p className="font-semibold text-ink">{customer.name}</p>
              {(customer.phone || customer.preference) && (
                <p className="mt-1 text-xs text-mauve">
                  {[customer.phone, customer.preference].filter(Boolean).join(' · ')}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
