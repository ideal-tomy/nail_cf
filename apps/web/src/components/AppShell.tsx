import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from './ui/Button';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex flex-1 flex-col items-center gap-1 border-t-2 py-2 text-xs font-semibold',
    isActive ? 'border-plum text-plum' : 'border-transparent text-mauve',
  ].join(' ');

function sectionLabel(pathname: string): string | null {
  if (pathname === '/') return 'ホーム';
  if (pathname === '/customers' || pathname.startsWith('/customers/')) return '顧客';
  if (pathname === '/bookings') return '予約';
  return null;
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, logout } = useAuth();
  const section = sectionLabel(location.pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col bg-porcelain">
      <header className="border-b border-petal/60 bg-card px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-ink">ネイルサロン</h1>
            <p className="text-xs text-mauve">
              {section && <span className="font-semibold text-plum">{section}</span>}
              {section && ' · '}
              {email ?? 'Cloudflare 版'}
            </p>
          </div>
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => void handleLogout()}>
            ログアウト
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-5">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 border-t border-petal/60 bg-card px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          <NavLink to="/" end className={linkClass}>
            ホーム
          </NavLink>
          <NavLink to="/customers" className={linkClass}>
            顧客
          </NavLink>
          <NavLink to="/bookings" className={linkClass}>
            予約
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
