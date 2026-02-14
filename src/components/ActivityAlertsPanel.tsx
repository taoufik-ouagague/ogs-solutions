import { useEffect, useState } from 'react';
import { AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { ActivityLog, useActivityLogs } from '../hooks/useActivityLogs';

export default function ActivityAlertsPanel() {
  const { activities } = useActivityLogs(20);
  const [recentAlerts, setRecentAlerts] = useState<ActivityLog[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Show only recent edits/deletes (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recent = activities.filter(
      activity =>
        (activity.action === 'edited' || activity.action === 'deleted') &&
        activity.timestamp > fiveMinutesAgo
    );
    setRecentAlerts(recent);
  }, [activities]);

  if (recentAlerts.length === 0) {
    return null;
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'edited':
        return <Edit2 className="h-5 w-5 text-blue-500" />;
      case 'deleted':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'edited':
        return 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-l-4 border-blue-500';
      case 'deleted':
        return 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border-l-4 border-red-500';
      default:
        return 'from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-900/30 border-l-4 border-gray-500';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'edited':
        return 'Order Updated';
      case 'deleted':
        return 'Order Deleted';
      default:
        return 'Order Changed';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed bottom-6 right-6 max-w-md z-40 space-y-3 max-h-96 overflow-y-auto">
      {recentAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`bg-gradient-to-r ${getActionColor(
            alert.action
          )} rounded-lg p-4 shadow-lg hover:shadow-xl transition-all`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">{getActionIcon(alert.action)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {getActionText(alert.action)}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    Order: <span className="font-medium">{alert.application_name}</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    by {alert.user_email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatTime(alert.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setExpandedId(expandedId === alert.id ? null : alert.id)
                  }
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="text-lg">
                    {expandedId === alert.id ? '−' : '+'}
                  </span>
                </button>
              </div>
              {expandedId === alert.id && alert.changes && (
                <div className="mt-3 pt-3 border-t border-gray-300/30 dark:border-gray-600/30">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Changes:
                  </p>
                  <div className="bg-white/40 dark:bg-black/20 rounded p-2 text-xs text-gray-700 dark:text-gray-300 font-mono max-h-24 overflow-y-auto">
                    <pre>{JSON.stringify(alert.changes, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
