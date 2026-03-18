import { toast } from "sonner";

const DEFAULT_DURATIONS = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
};

export const notify = {
  success: (message, options = {}) =>
    toast.success(message, {
      id: options.id,
      description: options.description,
      duration: options.duration || DEFAULT_DURATIONS.success,
      action: options.action,
    }),

  error: (message, options = {}) =>
    toast.error(message, {
      id: options.id,
      description: options.description,
      duration: options.duration || DEFAULT_DURATIONS.error,
      action: options.action,
    }),

  warning: (message, options = {}) =>
    toast.warning(message, {
      id: options.id,
      description: options.description,
      duration: options.duration || DEFAULT_DURATIONS.warning,
      action: options.action,
    }),

  info: (message, options = {}) =>
    toast.info(message, {
      id: options.id,
      description: options.description,
      duration: options.duration || DEFAULT_DURATIONS.info,
      action: options.action,
    }),

  promise: (promise, messages = {}) =>
    toast.promise(promise, {
      loading: messages.loading || "Loading...",
      success: messages.success || "Done!",
      error: messages.error || "Something went wrong",
    }),

  dismiss: (id) => toast.dismiss(id),
};
