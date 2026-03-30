// frontend/src/services/ui/activity-service.js

/**
 * Activity Notification Service  
 * Handles persistent activity notifications (likes, comments, shares, follows)
 * Notifications stay until manually read/cleared
 */

import StoreAccessor from "@/store/store-accessor";
import {
  addNotification,
  markAsRead,
  markAllAsRead,
  setNotifications,
  removeNotification
} from "@/store/slices/notifications"; // You'll need to create this slice

class ActivityService {
  constructor() {
    this.isConnected = false;
    this.notificationCallbacks = new Map();
    this.initialize();
  }

  // ==================== INITIALIZATION ====================

  async initialize() {
    await this.loadCachedNotifications();
    this.setupEventListeners();
  }

  async loadCachedNotifications() {
    try {
      const cached = localStorage.getItem('activityNotifications');
      if (cached) {
        const notifications = JSON.parse(cached);
        StoreAccessor.dispatch(setNotifications(notifications));
      }
    } catch (error) {
      console.warn('Failed to load cached notifications:', error);
    }
  }

  saveToCache(notifications) {
    try {
      localStorage.setItem('activityNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.warn('Failed to save notifications to cache:', error);
    }
  }

  // ==================== CORE ACTIVITY METHODS ====================

  /**
   * Add a new activity notification
   */
  async addActivityNotification(notification) {
    const activityNotification = {
      id: notification.id || `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: notification.type, // 'like', 'comment', 'share', 'follow', 'mention'
      userId: notification.userId,
      userName: notification.userName,
      userAvatar: notification.userAvatar,
      targetId: notification.targetId,
      targetType: notification.targetType,
      message: notification.message,
      preview: notification.preview,
      isRead: false,
      timestamp: new Date().toISOString(),
      metadata: notification.metadata || {}
    };

    StoreAccessor.dispatch(addNotification(activityNotification));
    this.triggerCallbacks('new-notification', activityNotification);

    return activityNotification;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    StoreAccessor.dispatch(markAsRead(notificationId));
    this.triggerCallbacks('notification-read', notificationId);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    StoreAccessor.dispatch(markAllAsRead());
    this.triggerCallbacks('all-notifications-read');
  }

  /**
   * Remove a notification
   */
  async removeNotification(notificationId) {
    StoreAccessor.dispatch(removeNotification(notificationId));
    this.triggerCallbacks('notification-removed', notificationId);
  }

  // ==================== CONVENIENCE METHODS ====================

  async notifyLike(data) {
    return this.addActivityNotification({
      type: 'like',
      userId: data.userId,
      userName: data.userName,
      userAvatar: data.userAvatar,
      targetId: data.postId,
      targetType: 'post',
      message: `${data.userName} liked your post`,
      preview: data.postPreview,
      metadata: { postId: data.postId }
    });
  }

  async notifyComment(data) {
    return this.addActivityNotification({
      type: 'comment',
      userId: data.userId,
      userName: data.userName,
      userAvatar: data.userAvatar,
      targetId: data.postId,
      targetType: 'post',
      message: `${data.userName} commented on your post`,
      preview: data.commentText,
      metadata: {
        postId: data.postId,
        commentId: data.commentId
      }
    });
  }

  async notifyShare(data) {
    return this.addActivityNotification({
      type: 'share',
      userId: data.userId,
      userName: data.userName,
      userAvatar: data.userAvatar,
      targetId: data.postId,
      targetType: 'post',
      message: `${data.userName} shared your post`,
      preview: data.postPreview,
      metadata: { postId: data.postId }
    });
  }

  async notifyFollow(data) {
    return this.addActivityNotification({
      type: 'follow',
      userId: data.userId,
      userName: data.userName,
      userAvatar: data.userAvatar,
      message: `${data.userName} started following you`,
      metadata: { userId: data.userId }
    });
  }

  // ==================== UTILITY METHODS ====================

  getUnreadCount() {
    const state = StoreAccessor.getState();
    return state.notifications.items.filter(n => !n.isRead).length;
  }

  getAllNotifications() {
    const state = StoreAccessor.getState();
    return state.notifications.items;
  }

  getUnreadNotifications() {
    const state = StoreAccessor.getState();
    return state.notifications.items.filter(n => !n.isRead);
  }

  filterByType(type) {
    const state = StoreAccessor.getState();
    return state.notifications.items.filter(n => n.type === type);
  }

  // ==================== EVENT SYSTEM ====================

  on(event, callback) {
    if (!this.notificationCallbacks.has(event)) {
      this.notificationCallbacks.set(event, []);
    }
    this.notificationCallbacks.get(event).push(callback);
  }

  off(event, callback) {
    if (this.notificationCallbacks.has(event)) {
      const callbacks = this.notificationCallbacks.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  triggerCallbacks(event, data) {
    if (this.notificationCallbacks.has(event)) {
      this.notificationCallbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Activity service callback error:', error);
        }
      });
    }
  }

  setupEventListeners() {
    // Auto-save to cache when notifications change
    let prevNotifications = [];

    StoreAccessor.subscribe(() => {
      const state = StoreAccessor.getState();
      const currentNotifications = state.notifications?.items || [];

      if (currentNotifications !== prevNotifications) {
        this.saveToCache(currentNotifications);
        prevNotifications = currentNotifications;
      }
    });
  }

  // ==================== CLEANUP ====================

  destroy() {
    this.notificationCallbacks.clear();
  }
}

// Singleton instance
export const activityService = new ActivityService();
export default activityService;







// Example 2: Activity Service Usage
// frontend/src/components/PostActions.jsx
// import { activityService, toastService } from '@/services/domain';

// function PostActions({ post, currentUser }) {
//   const handleLike = async () => {
//     try {
//       await api.likePost(post.id);

//       // ✅ Show immediate feedback to user who clicked
//       toastService.success('Liked!');

//       // ✅ Create persistent notification for POST OWNER (if different user)
//       if (post.userId !== currentUser.id) {
//         await activityService.notifyLike({
//           userId: currentUser.id,
//           userName: currentUser.name,
//           userAvatar: currentUser.avatar,
//           postId: post.id,
//           postPreview: post.content.substring(0, 50)
//         });
//         // This creates a notification that stays in the notification center
//         // until the post owner reads it
//       }

//     } catch (error) {
//       toastService.error('Failed to like post');
//     }
//   };

//   return (
//     <div>
//       <button onClick={handleLike}>❤️ Like</button>
//     </div>
//   );
// }


// 🎉 Summary:
// Toast Service: Temporary feedback("Success!", "Error!") - auto - disappears
// Activity Service: Persistent records("John liked your post") - stays until read