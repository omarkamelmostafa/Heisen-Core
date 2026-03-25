// frontend/src/lib/utils/modal-callback-registry.js
/**
 * ModalCallbackRegistry
 * 
 * A singleton registry for storing and retrieving modal callbacks (onConfirm, onCancel).
 * This keeps non-serializable functions out of the Redux store.
 */

class ModalCallbackRegistry {
  constructor() {
    this.callbacks = new Map();
  }

  /**
   * Register callbacks and return a unique ID
   */
  register(onConfirm, onCancel) {
    const id = `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.callbacks.set(id, { onConfirm, onCancel });
    return id;
  }

  /**
   * Execute a callback by ID and type
   */
  execute(id, type) {
    const entry = this.callbacks.get(id);
    if (!entry) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`ModalCallbackRegistry: No callbacks found for ID ${id}`);
      }
      return;
    }

    if (type === 'confirm' && typeof entry.onConfirm === 'function') {
      entry.onConfirm();
    } else if (type === 'cancel' && typeof entry.onCancel === 'function') {
      entry.onCancel();
    }

    // Usually we clear after execution unless it's a persistent dialog
    this.clear(id);
  }

  /**
   * Remove callbacks from the registry
   */
  clear(id) {
    this.callbacks.delete(id);
  }

  /**
   * Clear all (useful on navigation or reset)
   */
  clearAll() {
    this.callbacks.clear();
  }
}

// Singleton instance
export const modalCallbackRegistry = new ModalCallbackRegistry();
export default modalCallbackRegistry;
