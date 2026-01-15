import { getEventBus } from "../../../src/eventbus/event-bus";
import { EventType, Event } from "../../../src/eventbus/event-types";

describe("EventBus", () => {
  let eventBus: ReturnType<typeof getEventBus>;

  beforeEach(() => {
    // Reset singleton instance by accessing private field or creating new instance
    // For testing, we'll use the getEventBus which should work fine
    eventBus = getEventBus();
  });

  describe("publish and subscribe", () => {
    it("should publish and receive events", (done) => {
      const testEvent: Event = {
        type: EventType.JOB_POSTING_EXPIRING_SOON,
        payload: { jobId: "job-1", title: "Test Job" },
      };

      eventBus.subscribe(EventType.JOB_POSTING_EXPIRING_SOON, (event) => {
        expect(event.type).toBe(EventType.JOB_POSTING_EXPIRING_SOON);
        expect(event.payload.jobId).toBe("job-1");
        done();
      });

      eventBus.publish(testEvent);
    });

    it("should support multiple listeners for same event type", (done) => {
      let callCount = 0;
      const testEvent: Event = {
        type: EventType.JOB_POSTING_EXPIRED,
        payload: { jobId: "job-1" },
      };

      const listener1 = jest.fn(() => {
        callCount++;
        if (callCount === 2) done();
      });

      const listener2 = jest.fn(() => {
        callCount++;
        if (callCount === 2) done();
      });

      eventBus.subscribe(EventType.JOB_POSTING_EXPIRED, listener1);
      eventBus.subscribe(EventType.JOB_POSTING_EXPIRED, listener2);

      eventBus.publish(testEvent);
    });

    it("should handle async listeners", async () => {
      const testEvent: Event = {
        type: EventType.REMINDER_TRIGGER,
        payload: { triggerId: "trigger-1" },
      };

      const promise = new Promise<void>((resolve) => {
        eventBus.subscribe(EventType.REMINDER_TRIGGER, async (event) => {
          await new Promise((r) => setTimeout(r, 10));
          expect(event.payload.triggerId).toBe("trigger-1");
          resolve();
        });
      });

      eventBus.publish(testEvent);
      await promise;
    });

    it("should handle errors in listeners gracefully", (done) => {
      const testEvent: Event = {
        type: EventType.JOB_POSTING_EXPIRING_SOON,
        payload: {},
      };

      const errorListener = jest.fn(() => {
        throw new Error("Listener error");
      });

      const successListener = jest.fn(() => {
        expect(errorListener).toHaveBeenCalled();
        done();
      });

      eventBus.subscribe(EventType.JOB_POSTING_EXPIRING_SOON, errorListener);
      eventBus.subscribe(EventType.JOB_POSTING_EXPIRING_SOON, successListener);

      eventBus.publish(testEvent);
    });
  });

  describe("unsubscribe", () => {
    it("should unsubscribe a listener", () => {
      const listener = jest.fn();
      const testEvent: Event = {
        type: EventType.JOB_POSTING_EXPIRED,
        payload: {},
      };

      eventBus.subscribe(EventType.JOB_POSTING_EXPIRED, listener);
      eventBus.publish(testEvent);

      expect(listener).toHaveBeenCalledTimes(1);

      eventBus.unsubscribe(EventType.JOB_POSTING_EXPIRED, listener);
      eventBus.publish(testEvent);

      // Listener should still be called once (before unsubscribe)
      // Note: unsubscribe implementation may need adjustment
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("different event types", () => {
    it("should handle different event types independently", (done) => {
      let callCount = 0;

      const listener1 = jest.fn(() => {
        callCount++;
        if (callCount === 2) done();
      });

      const listener2 = jest.fn(() => {
        callCount++;
        if (callCount === 2) done();
      });

      eventBus.subscribe(EventType.JOB_POSTING_EXPIRING_SOON, listener1);
      eventBus.subscribe(EventType.JOB_POSTING_EXPIRED, listener2);

      eventBus.publish({
        type: EventType.JOB_POSTING_EXPIRING_SOON,
        payload: {},
      });

      eventBus.publish({
        type: EventType.JOB_POSTING_EXPIRED,
        payload: {},
      });
    });
  });
});
