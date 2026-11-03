import { toast as sonner, type ExternalToast } from "sonner";

const DEFAULT_DURATION = 5000;

function withDefaults(options?: ExternalToast): ExternalToast {
  return { duration: DEFAULT_DURATION, ...options };
}


export const toast = {
  success: (message: string, options?: ExternalToast) =>
    sonner.success(message, withDefaults(options)),
  error: (message: string, options?: ExternalToast) =>
    sonner.error(message, withDefaults(options)),
  warning: (message: string, options?: ExternalToast) =>
    sonner.warning(message, withDefaults(options)),
  info: (message: string, options?: ExternalToast) =>
    sonner.info(message, withDefaults(options)),
  loading: (message: string, options?: ExternalToast) =>
    sonner.loading(message, withDefaults(options)),
  dismiss: (id?: string | number) => sonner.dismiss(id),
};
