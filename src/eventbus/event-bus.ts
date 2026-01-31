import { EventEmitter } from "events";
import { Event, EventType, Listener } from "./event-types";
import { logger } from "../config/logger";

class EventBus {
  private emitter: EventEmitter;
  private listenerMap = new WeakMap<Listener, (event: Event) => Promise<void>>();

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(1000);
  }

  public publish(event: Event): void {
    this.emitter.emit(event.type, event);
  }

  public subscribe(eventType: EventType, listener: Listener): () => void {
    // Create wrapped listener that handles errors
    const wrappedListener = async (event: Event) => {
      try {
        await listener(event);
      } catch (error) {
        logger.error(`Error in listener for ${eventType}`, { error });
      }
    };

    // Map original listener to wrapped listener for later removal
    this.listenerMap.set(listener, wrappedListener);
    this.emitter.on(eventType, wrappedListener);

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, listener);
  }

  public unsubscribe(eventType: EventType, listener: Listener): void {
    const wrappedListener = this.listenerMap.get(listener);
    if (wrappedListener) {
      this.emitter.off(eventType, wrappedListener);
      this.listenerMap.delete(listener);
    }
  }

  public cleanup(): void {
    logger.info("Cleaning up all event bus listeners");
    this.emitter.removeAllListeners();
  }
}

let instance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!instance) {
    instance = new EventBus();
  }
  return instance;
}
