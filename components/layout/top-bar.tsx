'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useRef, type CSSProperties } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import Link from 'next/link';
import { Search, HelpCircle, FileText, Bell, Settings, Package, X, CheckCheck, ExternalLink } from 'lucide-react';
import { useSettings } from '@/components/settings/settings-provider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useSettings();

  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      _id: string;
      type: string;
      title: string;
      message: string;
      orderId?: string;
      orderNumber?: string;
      read: boolean;
      createdAt: string;
    }>
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const primaryColor = settings.adminPrimaryColor || '#16a34a';
  const accentColor = settings.accentColor || '#0f172a';
  const tagline = settings.tagline;
  const siteName = settings.siteName;
  const searchInputStyle = useMemo(() => ({ '--tw-ring-color': primaryColor } as CSSProperties & Record<string, string>), [primaryColor]);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationIdRef = useRef<string | null>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      // Check if admin is logged in
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      // Cookies are automatically sent with same-origin requests in Next.js
      const response = await fetch('/api/admin/notifications?unreadOnly=false&limit=20', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const newNotifications = data.notifications || [];
        const newUnreadCount = data.unreadCount || 0;

        // Check if there's a new notification (for toast)
        if (newNotifications.length > 0) {
          const latestNotification = newNotifications[0];
          const latestId = latestNotification._id;

          // If this is a new notification (different from last one we saw)
          if (lastNotificationIdRef.current && latestId !== lastNotificationIdRef.current) {
            // Check if it's unread and recent (within last 10 seconds)
            const notificationDate = new Date(latestNotification.createdAt);
            const now = new Date();
            const secondsDiff = (now.getTime() - notificationDate.getTime()) / 1000;

            if (!latestNotification.read && secondsDiff < 10) {
              // Show toast notification
              toast({
                title: latestNotification.title,
                description: latestNotification.message,
                variant: 'info',
              });
            }
          }

          // Update last seen notification ID
          if (!lastNotificationIdRef.current) {
            lastNotificationIdRef.current = latestId;
          } else if (latestId !== lastNotificationIdRef.current) {
            lastNotificationIdRef.current = latestId;
          }
        }

        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('[TopBar] Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => prev.map(notif => (notif._id === notificationId ? { ...notif, read: true } : notif)));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[TopBar] Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('[TopBar] Error marking all as read:', error);
    }
  };

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

    // Initial fetch
    fetchNotifications();

    // Set up polling every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 120000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
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

            <div className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>⌘</div>
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
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <button
                className='relative p-2 hover:bg-gray-100 rounded-lg cursor-pointer'
                title='Notifications'
                onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell size={20} className='text-gray-600' />
                {unreadCount > 0 && (
                  <Badge
                    className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600'
                    variant='destructive'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className='w-96 p-0' align='end'>
              <div className='flex items-center justify-between p-4 border-b'>
                <h3 className='font-semibold text-sm'>Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className='text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1'>
                    <CheckCheck size={14} />
                    Mark all as read
                  </button>
                )}
              </div>
              <ScrollArea className='h-[400px]'>
                {notifications.length === 0 ? (
                  <div className='p-8 text-center text-gray-500 text-sm'>No notifications</div>
                ) : (
                  <div className='divide-y'>
                    {notifications.map(notif => (
                      <div
                        key={notif._id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                        onClick={() => {
                          if (!notif.read) {
                            markAsRead(notif._id);
                          }
                          if (notif.orderId) {
                            router.push(`/admin/orders/${notif.orderId}`);
                            setNotificationsOpen(false);
                          }
                        }}>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-1'>
                              <h4 className='font-medium text-sm'>{notif.title}</h4>
                              {!notif.read && <div className='w-2 h-2 bg-blue-500 rounded-full shrink-0' />}
                            </div>
                            <p className='text-xs text-gray-600 mb-2'>{notif.message}</p>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-gray-400'>
                                {formatDistanceToNow(new Date(notif.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                              {notif.orderId && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    router.push(`/admin/orders/${notif.orderId}`);
                                    setNotificationsOpen(false);
                                  }}
                                  className='text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1'>
                                  View Order
                                  <ExternalLink size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

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

              <DropdownMenuItem className='text-red-600 cursor-pointer hover:bg-transparent' onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
