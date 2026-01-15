import { Event, EventType, Listener } from "./event-types";
declare class EventBus {
    private emitter;
    private listeners;
    constructor();
    publish(event: Event): void;
    subscribe(eventType: EventType, listener: Listener): void;
    unsubscribe(eventType: EventType, listener: Listener): void;
}
export declare function getEventBus(): EventBus;
export {};
//# sourceMappingURL=event-bus.d.ts.map