import { useState, useRef } from 'react';
import { Send, Paperclip, X, File } from 'lucide-react';
import { sendAdminMessage, formatFileSize } from '../lib/messageService';
import { toast } from '../utils/toast';

interface SendMessageProps {
  applicationId: string;
  userId: string;
  onMessageSent?: () => void;
}

export default function SendMessageComponent({ applicationId, userId, onMessageSent }: SendMessageProps) {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Limit to 5 files, max 10MB each
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length + selectedFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!message.trim() && selectedFiles.length === 0) {
      toast.error('Please enter a message or select a file');
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 Sending message from component...');
      console.log('  - applicationId:', applicationId);
      console.log('  - userId:', userId);
      console.log('  - message:', message);
      console.log('  - files:', selectedFiles.length);
      
      await sendAdminMessage(applicationId, userId, message, selectedFiles);
      
      console.log('✅ Message sent successfully from component');
      toast.success('Message sent successfully');
      setMessage('');
      setSelectedFiles([]);
      onMessageSent?.();
    } catch (error) {
      const errorMsg = (error as Error).message || 'Unknown error';
      console.error('❌ Error sending message from component:', error);
      
      // Provide specific guidance based on error type
      if (errorMsg.includes('GitHub storage not initialized')) {
        toast.error('📁 File uploads not configured. Text messages work fine.');
        console.info('💡 Tip: To enable file uploads, see SETUP_GITHUB_FILES.md');
      } else if (errorMsg.includes('Application ID and User ID are required')) {
        toast.error('Missing application or user information');
      } else {
        toast.error('Failed to send message');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
        />

        {/* File List */}
        {selectedFiles.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Attachments ({selectedFiles.length}/5)
            </p>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-600 p-2 rounded">
                <div className="flex items-center gap-2 min-w-0">
                  <File className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-500 rounded transition-colors flex-shrink-0"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || selectedFiles.length >= 5}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <Paperclip className="h-4 w-4" />
              Attach File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={loading || (!message.trim() && selectedFiles.length === 0)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {selectedFiles.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Max file size: 10MB per file. Max 5 files total.
          </p>
        )}
      </div>
    </div>
  );
}
