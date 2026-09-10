/**
 * Lightweight global toast notification helper for CampusNexus.
 */

export interface ToastOptions {
  title?: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning";
}

export const toast = {
  success: (title: string, description?: string) => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("cn-toast", {
        detail: { title, description, type: "success" },
      });
      window.dispatchEvent(event);
    }
  },
  error: (title: string, description?: string) => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("cn-toast", {
        detail: { title, description, type: "error" },
      });
      window.dispatchEvent(event);
    }
  },
  info: (title: string, description?: string) => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("cn-toast", {
        detail: { title, description, type: "info" },
      });
      window.dispatchEvent(event);
    }
  },
};
