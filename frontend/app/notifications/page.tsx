'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../components/landing/Header';
import { Footer } from '../../components/landing/Footer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notification.service';
import { NotificationItem } from '../../types/notification';
import { formatDate } from '../../utils/formatters';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Building2,
  CheckCheck,
  Trash2,
  ArrowRight,
  Lock,
  Clock,
  RotateCcw,
} from 'lucide-react';

type FilterType = 'all' | 'unread';

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await notificationService.fetchNotifications();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !authLoading) {
      setIsLoading(false);
      return;
    }

    if (user) {
      loadNotifications();
    }
  }, [user, authLoading]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await notificationService.markAsRead(notificationId);
    } catch {
      // Revert if error
      loadNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await notificationService.markAllAsRead();
    } catch {
      loadNotifications();
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      const target = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      await notificationService.deleteNotification(notificationId);
    } catch {
      loadNotifications();
    }
  };

  if (authLoading || (isLoading && user)) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Loading size="lg" text="Loading civic notifications..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512]">
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <Card className="p-8 bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] space-y-6 w-full shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold text-[#14201c] dark:text-[#ece9e1]">
                Citizen Sign-In Required
              </h2>
              <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
                Sign in to view real-time status updates on reports you filed, verified departmental resolutions, and community milestones.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/login?redirect=/notifications">
                <Button fullWidth size="lg">
                  Sign In to View Notifications
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getEventIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('resolved') || lower.includes('verified')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-[#0f6b4f]/10 text-[#0f6b4f] dark:text-[#5cc9a0] flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      );
    }
    if (lower.includes('rejected')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
      );
    }
    if (lower.includes('work') || lower.includes('started') || lower.includes('progress')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5" />
        </div>
      );
    }
    if (lower.includes('assigned') || lower.includes('department')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
      );
    }
    if (lower.includes('reopened')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <RotateCcw className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] flex items-center justify-center shrink-0">
        <Bell className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e5e1d8] dark:border-[#24312b] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-3xl font-semibold tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0f6b4f] text-white dark:bg-[#5cc9a0] dark:text-[#0e1512]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1]">
              Live updates on reports you filed, supported issues, and departmental triage decisions.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              isLoading={isMarkingAll}
              leftIcon={<CheckCheck className="w-4 h-4" />}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorMessage
            title="Notification Feed Error"
            message={error}
          />
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#e5e1d8] dark:border-[#24312b] pb-3">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#0f6b4f] text-white dark:bg-[#5cc9a0] dark:text-[#0e1512]'
                : 'text-[#5d6b65] dark:text-[#9aa8a1] hover:bg-[#e5e1d8]/50 dark:hover:bg-[#24312b]'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#0f6b4f] text-white dark:bg-[#5cc9a0] dark:text-[#0e1512]'
                : 'text-[#5d6b65] dark:text-[#9aa8a1] hover:bg-[#e5e1d8]/50 dark:hover:bg-[#24312b]'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((item) => (
              <Card
                key={item.id}
                onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                className={`p-4 sm:p-5 transition-all flex items-start gap-4 cursor-pointer relative ${
                  !item.isRead
                    ? 'bg-white dark:bg-[#141d19] border-l-4 border-l-[#0f6b4f] dark:border-l-[#5cc9a0] border-[#e5e1d8] dark:border-[#24312b] shadow-xs'
                    : 'bg-white/60 dark:bg-[#141d19]/60 border-[#e5e1d8] dark:border-[#24312b] opacity-80 hover:opacity-100'
                }`}
              >
                {/* Event Icon */}
                {getEventIcon(item.title)}

                {/* Content */}
                <div className="flex-1 space-y-1 pr-6">
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-semibold text-sm text-[#14201c] dark:text-[#ece9e1]">
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#0f6b4f] dark:bg-[#5cc9a0] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#44403c] dark:text-[#9aa8a1] leading-relaxed">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-[#a8a29e] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </span>
                    {item.problemId && (
                      <Link
                        href={`/problems/${item.problemId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-[#0f6b4f] dark:text-[#5cc9a0] hover:underline flex items-center gap-0.5"
                      >
                        <span>View Problem</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Delete / Dismiss */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, item.id)}
                  title="Dismiss notification"
                  className="absolute right-3 top-3 p-1.5 text-[#a8a29e] hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] space-y-3 max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-[#faf8f4] dark:bg-[#0e1512] border border-[#e5e1d8] dark:border-[#24312b] flex items-center justify-center mx-auto text-[#5d6b65] dark:text-[#9aa8a1]">
              <Bell className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-medium text-[#14201c] dark:text-[#ece9e1]">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-xs text-[#5d6b65] dark:text-[#9aa8a1] leading-relaxed">
                {filter === 'unread'
                  ? 'You are all caught up with civic updates.'
                  : 'Updates on your reports, supported issues, and department assignments will appear here.'}
              </p>
            </div>
            {filter === 'unread' && notifications.length > 0 && (
              <div className="pt-2">
                <Button size="sm" variant="outline" onClick={() => setFilter('all')}>
                  View All Notifications
                </Button>
              </div>
            )}
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
