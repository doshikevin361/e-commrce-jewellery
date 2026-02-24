'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search } from 'lucide-react';
import { useSettings } from '@/components/settings/settings-provider';

export function RetailerTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<{ fullName?: string; companyName?: string; email?: string } | null>(null);

  const primaryColor = settings.adminPrimaryColor || settings.primaryColor || '#16a34a';

  useEffect(() => {
    setMounted(true);
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

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const searchInputStyle = useMemo(
    () => ({ '--tw-ring-color': primaryColor } as React.CSSProperties & Record<string, string>),
    [primaryColor]
  );

  if (!mounted) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex flex-col w-full max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
              style={searchInputStyle}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 ml-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 pl-4 border-l border-none cursor-pointer">
                <div
                  className="w-10 h-10 rounded-full font-semibold flex items-center justify-center text-white text-sm"
                  style={{ background: primaryColor }}
                >
                  {userData?.fullName ? getInitials(userData.fullName) : userData?.companyName ? getInitials(userData.companyName) : 'R'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900">{userData?.companyName || userData?.fullName || 'Retailer'}</p>
                  <p className="text-xs text-gray-500">{userData?.email || ''}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled className="flex flex-col py-2 hover:bg-transparent cursor-default">
                <span className="text-sm font-medium">{userData?.companyName || userData?.fullName || 'Retailer'}</span>
                <span className="text-xs">{userData?.email || ''}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 cursor-pointer hover:bg-transparent" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
