/**
 * Messages Service - Handle admin messages with file attachments
 * Hybrid approach: Firestore for real-time chat data, GitHub for file storage
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import * as GitHubStorage from './githubStorage';
import { toast } from '../utils/toast';

export interface AdminMessage {
  id: string;
  application_id: string;
  user_id: string;
  from_admin: boolean;
  message: string;
  attachments: {
    name: string;
    url: string; // GitHub raw content URL
    path: string; // GitHub file path
    size: number;
    type: string;
    uploadedAt: Timestamp;
  }[];
  created_at: Timestamp;
  updated_at: Timestamp;
  read: boolean;
}

/**
 * Send a message from admin to client
 * Files are uploaded to GitHub (if configured), message metadata stored in Firestore
 */
export async function sendAdminMessage(
  applicationId: string,
  userId: string,
  message: string,
  files?: File[]
): Promise<string> {
  try {
    // Validate inputs
    if (!applicationId || !userId) {
      throw new Error('Application ID and User ID are required');
    }
    
    if (!message?.trim() && (!files || files.length === 0)) {
      throw new Error('Message or files required');
    }

    console.log('📤 Sending message:', { applicationId, userId, messageLength: message?.length, filesCount: files?.length });

    const attachments: AdminMessage['attachments'] = [];

    // Upload files if provided
    if (files && files.length > 0) {
      // Check if GitHub storage is initialized
      if (GitHubStorage.isInitialized()) {
        console.log(`📁 Uploading ${files.length} files to GitHub...`);
        for (const file of files) {
          try {
            console.log(`  📤 Uploading: ${file.name} (${file.size} bytes)`);
            const uploadResult = await GitHubStorage.uploadToGitHub(file, applicationId, userId);

            attachments.push({
              name: uploadResult.name,
              url: uploadResult.url,
              path: uploadResult.path,
              size: uploadResult.size,
              type: uploadResult.type,
              uploadedAt: Timestamp.now(),
            });
            console.log(`  ✅ File uploaded to GitHub: ${file.name}`);
          } catch (uploadError) {
            console.error(`❌ Error uploading file ${file.name} to GitHub:`, uploadError);
            throw new Error(`Failed to upload file: ${file.name}. ${(uploadError as Error).message}`);
          }
        }
      } else {
        console.warn('⚠️ GitHub storage not initialized - file uploads disabled');
        const setupGuide = 'See SETUP_GITHUB_FILES.md for setup instructions (5 min)';
        const errorMsg = `GitHub storage not configured. ${setupGuide}`;
        toast.error(errorMsg);
        console.error('📋 To enable file uploads:');
        console.error('  1. Visit: https://github.com/settings/tokens');
        console.error('  2. Generate new token (classic) with "repo" scope');
        console.error('  3. Create private repo: github.com/new (name: ogs-solutions-files)');
        console.error('  4. Add to .env.local:');
        console.error('     VITE_GITHUB_OWNER=your-username');
        console.error('     VITE_GITHUB_REPO=ogs-solutions-files');
        console.error('     VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxx');
        console.error('     VITE_GITHUB_BRANCH=main');
        console.error('  5. Restart: npm run dev');
        throw new Error('GitHub storage not initialized - file uploads not available');
      }
    }

    // Create message document in Firestore (real-time sync)
    console.log('💾 Creating message document in Firestore...');
    const messagesRef = collection(db, 'admin_messages');
    const messageData = {
      application_id: applicationId,
      user_id: userId,
      from_admin: true,
      message: message?.trim() || '',
      attachments,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      read: false,
    };
    
    console.log('📝 Message data:', messageData);
    const docRef = await addDoc(messagesRef, messageData);
    
    console.log('✅ Message sent successfully! ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time messages for an application
 */
/**
 * Subscribe to real-time messages for an application with current user ID
 */
export function subscribeToApplicationMessages(
  applicationId: string,
  userId: string,
  onUpdate: (messages: AdminMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  let hasReportedError = false; // Prevent repeated error reporting
  
  try {
    console.log('🔔 [SUBSCRIPTION] Starting subscription...');
    console.log('   applicationId:', applicationId);
    console.log('   userId:', userId);
    
    if (!applicationId) {
      const err = new Error('applicationId is required');
      console.error('❌ [SUBSCRIPTION]', err.message);
      onError?.(err);
      return () => {};
    }
    
    const messagesRef = collection(db, 'admin_messages');
    console.log('📂 [SUBSCRIPTION] Reference to admin_messages collection created');
    
    // Query without orderBy to avoid needing composite index
    // We'll sort on the client side instead
    const q = query(
      messagesRef,
      where('application_id', '==', applicationId)
    );
    console.log('🔍 [SUBSCRIPTION] Query created for applicationId:', applicationId);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        // Clear error flag on successful snapshot
        hasReportedError = false;
        
        console.log('📨 [SUBSCRIPTION] Snapshot received!');
        console.log('   Total docs:', snapshot.docs.length);
        console.log('   Metadata - hasPendingWrites:', snapshot.metadata.hasPendingWrites);
        console.log('   Metadata - fromCache:', snapshot.metadata.fromCache);
        
        const messages = snapshot.docs.map((doc, idx) => {
          const data = doc.data() as any;
          console.log(`   ✓ Doc[${idx}]:`, {
            id: doc.id,
            user_id: data.user_id,
            from_admin: data.from_admin,
            message_preview: data.message?.substring(0, 30),
            read: data.read
          });
          return {
            id: doc.id,
            ...data,
          };
        }) as AdminMessage[];
        
        // Sort by created_at descending on client side
        const sortedMessages = messages.sort((a, b) => {
          const timeA = a.created_at?.toMillis?.() || 0;
          const timeB = b.created_at?.toMillis?.() || 0;
          return timeB - timeA;
        });
        
        console.log('✅ [SUBSCRIPTION] Calling onUpdate with', sortedMessages.length, 'messages (sorted client-side)');
        onUpdate(sortedMessages);
      },
      (error: any) => {
        // Only report error once to prevent console spam
        if (!hasReportedError) {
          hasReportedError = true;
          console.error('❌ [SUBSCRIPTION] Error occurred!');
          console.error('   Code:', error.code);
          console.error('   Message:', error.message);
          if (error.code === 'permission-denied') {
            console.error('   ℹ️ Permission denied - user may not have access to messages or subscription may be loading');
            // For permission errors, try again with exponential backoff
            setTimeout(() => {
              console.log('🔄 [SUBSCRIPTION] Retrying after permission error...');
            }, 2000);
          }
        }
        onError?.(error as Error);
      }
    );
    
    console.log('✅ [SUBSCRIPTION] Listener attached, unsubscribe function ready');
    return unsubscribe;
  } catch (error) {
    console.error('❌ [SUBSCRIPTION] Exception during setup:', error);
    onError?.(error as Error);
    return () => {};
  }
}

/**
 * Get all messages for an application
 */
export async function getApplicationMessages(applicationId: string): Promise<AdminMessage[]> {
  try {
    const messagesRef = collection(db, 'admin_messages');
    const q = query(
      messagesRef,
      where('application_id', '==', applicationId)
    );

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminMessage[];
    
    // Sort by created_at descending on client side
    return messages.sort((a, b) => {
      const timeA = a.created_at?.toMillis?.() || 0;
      const timeB = b.created_at?.toMillis?.() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

/**
 * Get unread messages count for a user
 */
export async function getUnreadMessagesCount(userId: string): Promise<number> {
  try {
    const messagesRef = collection(db, 'admin_messages');
    const q = query(
      messagesRef,
      where('user_id', '==', userId),
      where('read', '==', false),
      where('from_admin', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  try {
    const messageRef = doc(db, 'admin_messages', messageId);
    await updateDoc(messageRef, {
      read: true,
      updated_at: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

/**
 * Delete a message and its attachments from Firestore and GitHub
 */
export async function deleteAdminMessage(messageId: string): Promise<void> {
  try {
    const messageRef = doc(db, 'admin_messages', messageId);
    const messageSnap = await getDocs(query(collection(db, 'admin_messages'), where('__name__', '==', messageId)));

    if (messageSnap.empty) return;

    const message = messageSnap.docs[0].data() as AdminMessage;

    // Delete attachments from GitHub
    for (const attachment of message.attachments || []) {
      try {
        if (attachment.path) {
          console.log('🗑️ Deleting attachment from GitHub:', attachment.name);
          await GitHubStorage.deleteFromGitHub(attachment.path);
        }
      } catch (err) {
        console.error('Error deleting attachment from GitHub:', err);
        // Continue with other attachments even if one fails
      }
    }

    // Delete message document from Firestore
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

/**
 * Get download URL for a file
 * For GitHub files, return the URL directly (already a raw content URL)
 */
export function getFileDownloadURL(filePath: string): string {
  try {
    // GitHub files are stored as filePath in format: messages/{applicationId}/{userId}/{timestamp}_{filename}
    return GitHubStorage.getDownloadURL(filePath);
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
