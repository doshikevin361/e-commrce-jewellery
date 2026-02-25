'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSettings } from '@/components/settings/settings-provider';
import { LogOut, LayoutDashboard, Package, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', href: '/retailer', icon: LayoutDashboard },
  { label: 'Products', href: '/retailer/products', icon: ShoppingBag },
  { label: 'Orders', href: '/retailer/orders', icon: Package },
];

export function RetailerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, loading } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [userData, setUserData] = useState<{ fullName?: string; companyName?: string; email?: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedOpen = localStorage.getItem('retailerSidebarOpen') !== 'false';
    setIsOpen(savedOpen);
    try {
      const u = localStorage.getItem('retailerUser');
      if (u) setUserData(JSON.parse(u));
    } catch {
      setUserData(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('retailerToken');
    localStorage.removeItem('retailerUser');
    router.push('/retailer/login');
  };

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('retailerSidebarOpen', String(newState));
  };

  const primaryColor = settings.adminPrimaryColor || settings.primaryColor || '#22C55E';
  const brandName = settings.siteName || 'B2B';
  const brandLogo = settings.logo;
  const brandInitials = useMemo(() => brandName.slice(0, 2).toUpperCase(), [brandName]);
  const brandBadgeStyle = useMemo(() => ({ background: primaryColor }), [primaryColor]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  if (!mounted) return null;

  return (
    <aside
      className={`${isOpen ? 'w-64' : 'w-20'} min-h-screen flex flex-col transition-all duration-300 bg-white border-r border-gray-200`}
    >
      <div className="p-4 flex items-center justify-between border-gray-200">
        {isOpen ? (
          <>
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base overflow-hidden"
                style={brandBadgeStyle}
              >
                {loading ? (
                  <div className="w-full h-full animate-pulse bg-gray-200" />
                ) : brandLogo ? (
                  <img
                    src={brandLogo}
                    alt={brandName}
                    className="h-full w-full object-contain transition-opacity duration-300"
                  />
                ) : (
                  !loading && <span>{brandInitials}</span>
                )}
              </div>
              {loading ? (
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              ) : (
                <span className="text-gray-900 font-bold text-base truncate">{brandName} B2B</span>
              )}
            </div>
            <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Collapse sidebar">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          </>
        ) : (
          <button onClick={toggleSidebar} className="w-full flex flex-col items-center gap-2" aria-label="Expand sidebar">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-base overflow-hidden"
              style={brandBadgeStyle}
            >
              {brandLogo ? (
                <img src={brandLogo} alt={brandName} className="h-full w-full object-contain" />
              ) : (
                <span>{brandInitials}</span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {isOpen && <div className="px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider">MENU</div>}

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = item.href === '/retailer' ? pathname === '/retailer' : pathname === item.href || pathname.startsWith(item.href + '/');
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                isOpen ? '' : 'justify-center'
              } ${isActive ? 'text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              style={isActive ? { backgroundColor: primaryColor } : undefined}
              title={!isOpen ? item.label : undefined}
            >
              <IconComponent className="w-5 h-5 shrink-0" />
              {isOpen && <span className="flex-1 truncate text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isOpen ? 'bg-gray-50' : ''}`}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={brandBadgeStyle}
          >
            {userData?.fullName ? getInitials(userData.fullName) : userData?.companyName ? getInitials(userData.companyName) : 'R'}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userData?.companyName || userData?.fullName || 'Retailer'}</p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs cursor-pointer text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
