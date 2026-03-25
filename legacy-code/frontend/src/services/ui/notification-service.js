// frontend/src/services/ui/notification-service.js

/**
 * Enterprise Notification Service
 * Comprehensive notification management with clear separation of implemented vs planned features
 */

import StoreAccessor from "@/store/store-accessor";
import { showNotification as showUINotification } from "@/store/slices/ui";

class NotificationService {
  get isBrowser() {
    return typeof window !== "undefined";
  }

  constructor() {
    this.channels = new Map();
    this.preferences = {
      enabled: true,
      channels: {
        inApp: true,    // ✅ Implemented
        push: false,    // 🚧 Planned - needs service worker setup
        email: false,   // 🚧 Planned - needs backend integration
        sms: false,     // 🚧 Planned - needs backend integration
      },
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
      },
    };

    if (this.isBrowser) {
      this.initialize();
    }
  }

  // ==================== ✅ IMPLEMENTED FEATURES ====================

  /**
   * Core Notification System - IMPLEMENTED
   */
  async initialize() {
    await this.loadPreferences();
    await this.initializeChannels();
    // Background sync is planned - see below
  }

  async loadPreferences() {
    if (!this.isBrowser) return;

    try {
      const saved = localStorage.getItem("notificationPreferences");
      if (saved) {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn("Failed to load notification preferences:", error);
    }
  }

  async initializeChannels() {
    // ✅ In-app notifications (always available)
    this.channels.set("inApp", {
      name: "In-App",
      enabled: this.preferences.channels.inApp,
      send: this.sendInAppNotification.bind(this),
    });

    // 🚧 Push notifications - planned (see below)
    if (this.isBrowser && "Notification" in window && "serviceWorker" in navigator) {
      this.channels.set("push", {
        name: "Push",
        enabled: this.preferences.channels.push,
        send: this.sendPushNotification.bind(this),
      });
    }
  }

  /**
   * Core Notification Dispatch - IMPLEMENTED
   */
  async notify(notification) {
    if (!this.preferences.enabled || this.isQuietHours()) {
      return;
    }

    const enhancedNotification = this.enhanceNotification(notification);

    // Send through enabled channels
    const promises = [];

    for (const [channelName, channel] of this.channels) {
      if (
        channel.enabled &&
        this.shouldSendToChannel(enhancedNotification, channelName)
      ) {
        promises.push(
          channel.send(enhancedNotification).catch((error) => {
            console.error(
              `Failed to send notification via ${channelName}:`,
              error
            );
          })
        );
      }
    }

    await Promise.allSettled(promises);
    this.trackNotification(enhancedNotification);
  }

  /**
   * In-App Notifications - IMPLEMENTED
   */
  async sendInAppNotification(notification) {
    StoreAccessor.dispatch(
      showUINotification({
        id: notification.id,
        type: notification.type || "info",
        title: notification.title,
        message: notification.message,
        duration: notification.duration || 5000,
        action: notification.action,
        metadata: notification.metadata,
      })
    );
  }

  /**
   * Convenience Methods - IMPLEMENTED
   */
  async success(title, message, options = {}) {
    return this.notify({
      type: "success",
      title,
      message,
      ...options,
    });
  }

  async error(title, message, options = {}) {
    return this.notify({
      type: "error",
      title,
      message,
      ...options,
    });
  }

  async warning(title, message, options = {}) {
    return this.notify({
      type: "warning",
      title,
      message,
      ...options,
    });
  }

  async info(title, message, options = {}) {
    return this.notify({
      type: "info",
      title,
      message,
      ...options,
    });
  }

  // ==================== 🚧 PLANNED FEATURES ====================

  /**
   * Push Notifications - PLANNED
   * @todo Requires service worker registration and backend push service
   */
  async sendPushNotification(notification) {
    if (!this.isBrowser) return;
    console.warn('🔄 NotificationService: Push notifications not fully implemented');

    if (!("Notification" in window)) {
      throw new Error("Push notifications not supported in this browser");
    }

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Push notification permission denied by user");
      }
    }

    if (Notification.permission === "granted") {
      // 🚧 TODO: Implement proper service worker integration
      console.log('📱 Push notification would be sent:', notification.title);

      // Temporary fallback to browser notifications
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || "/icons/notification-icon.png",
      });
    }
  }

  /**
   * Urgent Notifications - PLANNED
   * @todo Implement priority system and bypass logic
   */
  async notifyUrgent(notification) {
    console.warn('🔄 NotificationService: Urgent notifications not fully implemented');

    // For now, just send as regular notification
    return this.notify({
      ...notification,
      priority: "high"
    });
  }

  /**
   * Scheduled Notifications - PLANNED
   * @todo Implement proper scheduling system with persistence
   */
  scheduleNotification(notification, deliverAt) {
    console.warn('🔄 NotificationService: Scheduled notifications not fully implemented');

    const now = Date.now();
    const deliveryTime = new Date(deliverAt).getTime();

    if (deliveryTime <= now) {
      return this.notify(notification);
    }

    const delay = deliveryTime - now;

    // 🚧 TODO: Implement persistent scheduling
    setTimeout(() => {
      this.notify(notification);
    }, delay);

    return delay;
  }

  /**
   * Background Sync - PLANNED
   * @todo Implement service worker background sync for offline support
   */
  setupBackgroundSync() {
    if (this.isBrowser && "serviceWorker" in navigator && "SyncManager" in window) {
      console.warn('🔄 NotificationService: Background sync not fully implemented');
      // 🚧 TODO: Implement proper background sync
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register("notification-sync");
      });
    }
  }

  /**
   * Email & SMS Channels - PLANNED
   * @todo Requires backend integration for email/SMS services
   */
  async initializeEmailChannel() {
    console.warn('🔄 NotificationService: Email channel not implemented');
    // 🚧 TODO: Implement when backend email service is available
  }

  async initializeSMSChannel() {
    console.warn('🔄 NotificationService: SMS channel not implemented');
    // 🚧 TODO: Implement when backend SMS service is available
  }

  // ==================== 🛠️ UTILITY METHODS ====================

  enhanceNotification(notification) {
    const id =
      notification.id ||
      `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = notification.timestamp || new Date().toISOString();

    return {
      id,
      timestamp,
      type: "info",
      priority: "normal",
      channels: ["inApp"], // Default to in-app only
      ...notification,
    };
  }

  shouldSendToChannel(notification, channelName) {
    return notification.channels.includes(channelName);
  }

  isQuietHours() {
    if (!this.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = this.preferences.quietHours.start
      .split(":")
      .map(Number);
    const [endHour, endMinute] = this.preferences.quietHours.end
      .split(":")
      .map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  // ==================== ⚙️ PREFERENCE MANAGEMENT ====================

  updatePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };

    // Update channel states
    for (const [channelName, channel] of this.channels) {
      if (this.preferences.channels[channelName] !== undefined) {
        channel.enabled = this.preferences.channels[channelName];
      }
    }

    this.savePreferences();
  }

  async savePreferences() {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(
        "notificationPreferences",
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.warn("Failed to save notification preferences:", error);
    }
  }

  enableChannel(channelName) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.enabled = true;
      this.preferences.channels[channelName] = true;
      this.savePreferences();
    }
  }

  disableChannel(channelName) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.enabled = false;
      this.preferences.channels[channelName] = false;
      this.savePreferences();
    }
  }

  // ==================== 📊 SERVICE STATUS & ANALYTICS ====================

  trackNotification(notification) {
    // Basic tracking - implement analytics when needed
    console.log('📨 Notification sent:', {
      id: notification.id,
      type: notification.type,
      channels: notification.channels
    });

    // 🚧 TODO: Integrate with analytics service when available
    if (this.isBrowser && window.analytics) {
      window.analytics.track("notification_sent", {
        notification_id: notification.id,
        type: notification.type,
        channel: notification.channels,
        priority: notification.priority,
      });
    }
  }

  /**
   * Get service status and available features
   */
  getServiceStatus() {
    return {
      implemented: {
        inAppNotifications: true,
        basicPreferences: true,
        quietHours: true,
        convenienceMethods: true
      },
      planned: {
        pushNotifications: this.channels.has('push'),
        scheduledNotifications: false,
        urgentNotifications: false,
        backgroundSync: false,
        emailChannel: false,
        smsChannel: false,
        analyticsIntegration: false
      },
      channels: Array.from(this.channels.keys())
    };
  }

  /**
   * Health check for notification service
   */
  async healthCheck() {
    const status = this.getServiceStatus();

    return {
      status: 'healthy',
      timestamp: Date.now(),
      availableChannels: status.channels,
      implementedFeatures: Object.keys(status.implemented).filter(k => status.implemented[k]),
      preferences: this.preferences
    };
  }

  // ==================== 🗑️ CLEANUP ====================

  destroy() {
    this.channels.clear();
    console.log('🧹 NotificationService: Cleaned up channels');
  }
}

// Singleton instance
export const notificationService = new NotificationService();
export default notificationService;
