import { useNavigate } from 'react-router-dom';
import { createCustomer } from '../lib/api';
import { CustomerForm } from '../components/customers/CustomerForm';
import { useToast } from '../components/ui/Toast';

export function CustomerNewPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-ink">顧客を登録</h2>
      <section className="rounded-2xl bg-card p-4 shadow-sm">
        <CustomerForm
          submitLabel="登録する"
          onCancel={() => navigate('/customers')}
          onSubmit={async (input) => {
            const customer = await createCustomer(input);
            showToast(`${customer.name}さんを登録しました`);
            navigate(`/customers/${customer.id}`);
          }}
        />
      </section>
    </div>
  );
}
