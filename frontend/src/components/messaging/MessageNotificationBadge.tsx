'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { useGetUnreadCountQuery } from '@/store/api/messageApi';
import { useSocket } from '@/lib/socket-context';
import { toast } from 'sonner';

export default function MessageNotificationBadge() {
  const router = useRouter();
  const { onMessageNotification } = useSocket();
  const { data: unreadData, refetch } = useGetUnreadCountQuery();

  const unreadCount = unreadData?.data?.unreadCount || 0;

  // Listen for message notifications
  useEffect(() => {
    const cleanup = onMessageNotification((data) => {
      // Show toast notification
      toast.info(
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 font-semibold">
              {data.sender?.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{data.sender?.name || 'Someone'}</p>
            <p className="text-sm text-gray-600">{data.message?.content || 'Sent you a message'}</p>
          </div>
        </div>,
        {
          duration: 4000,
          action: {
            label: 'View',
            onClick: () => router.push('/messages')
          }
        }
      );

      // Refetch unread count
      refetch();
    });

    return cleanup;
  }, [onMessageNotification, router, refetch]);

  return (
    <button
      onClick={() => router.push('/messages')}
      className="relative hover:scale-110 transition-transform"
      aria-label="Messages"
    >
      <MessageSquare className="w-6 h-6 text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
