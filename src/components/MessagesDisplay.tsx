import { useEffect, useState } from 'react';
import { Download, MessageSquare, Trash2, CheckCircle2 } from 'lucide-react';
import { AdminMessage, subscribeToApplicationMessages, markMessageAsRead, formatFileSize, deleteAdminMessage, getFileDownloadURL } from '../lib/messageService';
import { toast } from '../utils/toast';
import { showConfirm } from '../utils/confirmDialog';
import { useAutoTranslate } from '../contexts/TranslationContext';

interface MessagesDisplayProps {
  applicationId: string;
  userId?: string;
  isAdmin?: boolean;
}

export default function MessagesDisplay({ applicationId, userId, isAdmin = false }: MessagesDisplayProps) {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { translatedText: noMessagesText } = useAutoTranslate('No messages yet');

  useEffect(() => {
    if (!userId) {
      console.error('❌ [COMPONENT] No userId provided to MessagesDisplay');
      setMessages([]);
      setLoading(false);
      setHasError(false);
      return;
    }
    
    setLoading(true);
    setHasError(false);
    console.log('📱 [COMPONENT] MessagesDisplay mounting');
    console.log('   applicationId:', applicationId);
    console.log('   userId:', userId);
    console.log('   isAdmin:', isAdmin);
    
    // Subscribe to real-time messages
    const unsubscribe = subscribeToApplicationMessages(
      applicationId,
      userId,
      async (msgs) => {
        console.log('📥 [COMPONENT] Received', msgs.length, 'messages from subscription');
        msgs.forEach((msg, idx) => {
          console.log(`     [${idx}] user_id=${msg.user_id}, from_admin=${msg.from_admin}`);
        });
        
        // Mark as read for clients
        if (!isAdmin) {
          console.log('👤 [COMPONENT] Client mode - marking admin messages as read');
          for (const msg of msgs) {
            if (!msg.read && msg.from_admin) {
              console.log('     Marking message as read:', msg.id);
              try {
                await markMessageAsRead(msg.id);
              } catch (err) {
                console.error('     Error marking as read:', err);
              }
            }
          }
        }
        
        console.log('✅ [COMPONENT] Setting state with', msgs.length, 'messages');
        setMessages(msgs);
        setLoading(false);
        setHasError(false);
      },
      (error) => {
        console.error('❌ [COMPONENT] Subscription error:', error);
        // Only show error toast once, not repeatedly
        if (!hasError) {
          const errorCode = (error as any).code;
          if (errorCode === 'permission-denied') {
            console.info('ℹ️ Permission denied for messages - loading may be in progress');
            // Don't show error for permission denied, it may resolve itself
          } else {
            toast.error(`Failed to load messages: ${(error as Error).message}`);
          }
          setHasError(true);
        }
        setMessages([]);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 [COMPONENT] Cleanup: Unsubscribing from messages');
      unsubscribe();
    };
  }, [applicationId, userId, isAdmin]);

  const handleDelete = async (messageId: string) => {
    if (!isAdmin) return;
    
    const confirmed = await showConfirm(
      'Are you sure you want to delete this message? This cannot be undone.',
      'Delete Message'
    );

    if (!confirmed) return;

    try {
      await deleteAdminMessage(messageId);
      setMessages(messages.filter(m => m.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
      console.error(error);
    }
  };

  const handleDownload = async (attachment: { url?: string; path?: string; name: string }) => {
    try {
      // GitHub files are already available at the URL (raw content)
      const downloadUrl = attachment.url || (attachment.path ? getFileDownloadURL(attachment.path) : null);
      
      if (!downloadUrl) {
        toast.error('No download URL available');
        return;
      }
      
      // Fetch the file and create a blob download
      // This works around browser preview behavior for certain file types
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Create download link with blob URL
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded: ${attachment.name}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 py-8 px-4 text-center">
        <MessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">{noMessagesText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`border rounded-lg p-4 ${
            message.read
              ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${message.read ? 'bg-gray-400' : 'bg-blue-500'}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {message.from_admin ? '📧 Admin Message' : '👤 Client Message'}
              </span>
              {message.read && !message.from_admin && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
            {isAdmin && (
              <button
                onClick={() => handleDelete(message.id)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Delete message"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            )}
          </div>

          {/* Timestamp */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {message.created_at.toDate().toLocaleString()}
          </p>

          {/* Message Content */}
          <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap break-words">
            {message.message}
          </p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                📎 Attachments ({message.attachments.length})
              </p>
              {message.attachments.map((attachment, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white dark:bg-gray-600 p-2 rounded"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                          {attachment.name.split('.').pop()?.toUpperCase().slice(0, 3)}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-200 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(attachment)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-500 rounded transition-colors flex-shrink-0"
                    title="Download file"
                  >
                    <Download className="h-4 w-4 text-blue-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
