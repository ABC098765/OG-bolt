import React, { useState, useEffect } from 'react';
import { Bell, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { FirestoreNotification } from '../types/firestore';

export default function Notifications() {
  const { state: authState, dispatch: authDispatch } = useAuth();
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Redirect to sign in if not authenticated
  React.useEffect(() => {
    if (!authState.isAuthenticated && authState.user === null) {
      authDispatch({ type: 'SHOW_AUTH_MODAL' });
    }
  }, [authState.isAuthenticated, authDispatch]);

  useEffect(() => {
    if (authState.user) {
      loadNotifications();
    }
  }, [authState.user]);

  const loadNotifications = async () => {
    if (!authState.user) return;
    
    try {
      if (!refreshing) {
        setLoading(true);
      }
      const userNotifications = await firestoreService.getUserNotifications(authState.user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      if (!refreshing) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await firestoreService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await firestoreService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') {
      return !notification.is_read;
    }
    return true;
  });

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <Bell className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign in required</h2>
            <p className="text-xl text-gray-600 mb-8">
              Please sign in to view your notifications.
            </p>
            <button 
              onClick={() => authDispatch({ type: 'SHOW_AUTH_MODAL' })}
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Bell className="w-6 h-6 mr-2" />
                Notifications
              </h1>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  refreshing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'unread'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Unread
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'unread' 
                    ? 'All caught up! You have no unread notifications.'
                    : 'You have no notifications yet. They will appear here when you receive them.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notification.is_read
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{notification.body}</p>
                        <p className="text-sm text-gray-500">
                          {firestoreService.timestampToDate(notification.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id!)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id!)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}