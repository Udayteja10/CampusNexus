import { CommunityEvent, CommunityEventType } from "@/types/post.types";

type CommunityEventListener = (event: CommunityEvent) => void;

class CommunityEventBusClass {
  private listeners: Map<string, Set<CommunityEventListener>> = new Map();

  /**
   * Subscribe to a specific community event type or to all events ("*")
   */
  subscribe(type: CommunityEventType | "*", listener: CommunityEventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    // Return an unsubscribe function
    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  /**
   * Publish an event to the bus
   */
  publish(event: CommunityEvent): void {
    // 1. Notify listeners subscribed to this specific event type
    const specificListeners = this.listeners.get(event.type);
    if (specificListeners) {
      specificListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          console.error(`Error in event listener for ${event.type}:`, err);
        }
      });
    }

    // 2. Notify wildcard listeners
    const wildcardListeners = this.listeners.get("*");
    if (wildcardListeners) {
      wildcardListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          console.error(`Error in wildcard event listener:`, err);
        }
      });
    }
  }
}

export const CommunityEventBus = new CommunityEventBusClass();
export type { CommunityEventListener };
