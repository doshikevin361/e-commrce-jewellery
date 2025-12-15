'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import Link from 'next/link';
import {
  Search,
  HelpCircle,
  FileText,
  Bell,
  Settings,
  Package,
  X,
  CheckCheck
} from 'lucide-react';
import { useSettings } from '@/components/settings/settings-provider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useSettings();

  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    _id: string;
    type: string;
    title: string;
    message: string;
    orderId?: string;
    orderNumber?: string;
    read: boolean;
    createdAt: string;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const primaryColor = settings.primaryColor || '#16a34a';
  const accentColor = settings.accentColor || '#0f172a';
  const tagline = settings.tagline;
  const siteName = settings.siteName;
  const searchInputStyle = useMemo(
    () => ({ '--tw-ring-color': primaryColor }) as CSSProperties & Record<string, string>,
    [primaryColor],
  );

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing user:', err);
      }
    }
  }, []);

  const getBreadcrumb = () => {
    const segs = pathname.split('/').filter(Boolean);
    return segs.map(seg => seg[0].toUpperCase() + seg.slice(1)).join(' > ');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    router.push('/login');
  };

  const handleProfile = () => router.push('/admin/profile');
  const handleSettings = () => router.push('/admin/settings');

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  if (!mounted) return null;

  return (
    <header className='bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40'>
      <div className='flex items-center justify-between'>
        
        {/* LEFT SIDE */}
        <div className='flex flex-col w-full max-w-2xl'>

          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={20} />

            <input
              type='text'
              placeholder='Search...'
              className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2'
              style={searchInputStyle}
            />

            <div className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>
              ⌘ 
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className='flex items-center space-x-4 ml-6'>
          
          {/* Market Status */}
          {/* <div className='hidden lg:flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
            <span className='text-xs font-semibold text-green-700'>Market Open</span>
          </div> */}

          {/* Help */}
          <button className='p-2 hover:bg-gray-100 rounded-lg cursor-pointer' title='Help'>
            <HelpCircle size={20} className='text-gray-600' />
          </button>

          {/* Docs */}
          <button className='p-2 hover:bg-gray-100 rounded-lg cursor-pointer' title='Documentation'>
            <FileText size={20} className='text-gray-600' />
          </button>

          {/* Notifications */}
          <button className='p-2 hover:bg-gray-100 rounded-lg cursor-pointer' title='Notifications'>
            <Bell size={20} className='text-gray-600' />
          </button>

          {/* Settings */}
          <Link href='/admin/settings' className='p-2 hover:bg-gray-100 rounded-lg cursor-pointer'>
            <Settings size={20} className='text-gray-600' />
          </Link>

          {/* USER DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-3 pl-4 border-l border-none cursor-pointer'>
                <div
                  className='w-10 h-10 rounded-full font-semibold flex items-center justify-center text-white text-sm'
                  style={{ background: ` ${primaryColor}` }}>
                  {userData ? getInitials(userData.name) : 'A'}
                </div>

                <div className='hidden lg:block text-left'>
                  <p className='text-sm font-medium text-gray-900'>{userData?.name || 'Admin'}</p>
                  <p className='text-xs text-gray-500'>{userData?.email || 'admin@email.com'}</p>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem disabled className='flex flex-col py-2 hover:bg-transparent cursor-default'>
                <span className='text-sm font-medium'>{userData?.name || 'Admin'}</span>
                <span className='text-xs'>{userData?.email || 'admin@email.com'}</span>
              </DropdownMenuItem>

              <DropdownMenuItem className='cursor-pointer hover:bg-transparent' onClick={handleProfile}>
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem className='cursor-pointer hover:bg-transparent' onClick={handleSettings}>
                Settings
              </DropdownMenuItem>

              <DropdownMenuItem
                className='text-red-600 cursor-pointer hover:bg-transparent'
                onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
