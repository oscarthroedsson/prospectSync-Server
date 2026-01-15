import { EventEmitter } from "events";
import { Event, EventType, Listener } from "./event-types";

class EventBus {
  private emitter: EventEmitter;
  private listeners: Map<EventType, Listener[]> = new Map();

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(1000);
  }

  public publish(event: Event): void {
    this.emitter.emit(event.type, event);
  }

  public subscribe(eventType: EventType, listener: Listener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    const wrappedListener = async (event: Event) => {
      try {
        await listener(event);
      } catch (error) {
        console.error(`Error in listener for ${eventType}:`, error);
      }
    };

    this.emitter.on(eventType, wrappedListener);
  }

  public unsubscribe(eventType: EventType, listener: Listener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
        // Note: EventEmitter doesn't support removing specific listeners easily
        // This is a simplified implementation
        this.emitter.removeAllListeners(eventType);
        // Re-register remaining listeners
        listeners.forEach((l) => {
          const wrappedListener = async (event: Event) => {
            try {
              await l(event);
            } catch (error) {
              console.error(`Error in listener for ${eventType}:`, error);
            }
          };
          this.emitter.on(eventType, wrappedListener);
        });
      }
    }
  }
}

let instance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!instance) {
    instance = new EventBus();
  }
  return instance;
}
