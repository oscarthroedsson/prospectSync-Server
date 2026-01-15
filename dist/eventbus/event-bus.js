"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventBus = getEventBus;
const events_1 = require("events");
class EventBus {
    emitter;
    listeners = new Map();
    constructor() {
        this.emitter = new events_1.EventEmitter();
        this.emitter.setMaxListeners(1000);
    }
    publish(event) {
        this.emitter.emit(event.type, event);
    }
    subscribe(eventType, listener) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(listener);
        const wrappedListener = async (event) => {
            try {
                await listener(event);
            }
            catch (error) {
                console.error(`Error in listener for ${eventType}:`, error);
            }
        };
        this.emitter.on(eventType, wrappedListener);
    }
    unsubscribe(eventType, listener) {
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
                    const wrappedListener = async (event) => {
                        try {
                            await l(event);
                        }
                        catch (error) {
                            console.error(`Error in listener for ${eventType}:`, error);
                        }
                    };
                    this.emitter.on(eventType, wrappedListener);
                });
            }
        }
    }
}
let instance = null;
function getEventBus() {
    if (!instance) {
        instance = new EventBus();
    }
    return instance;
}
//# sourceMappingURL=event-bus.js.map