package eventbus

import (
	"sync"
	"testing"
	"time"
)

func TestBus_Get(t *testing.T) {
	bus1 := Get()
	bus2 := Get()

	// Should return the same instance (singleton)
	if bus1 != bus2 {
		t.Error("Expected Get() to return the same instance")
	}
}

func TestBus_PublishSubscribe(t *testing.T) {
	bus := Get()
	var receivedEvent Event
	var mu sync.Mutex
	eventReceived := make(chan struct{}, 1)

	// Subscribe to an event
	bus.Subscribe(EventApplicationCreated, func(e Event) {
		mu.Lock()
		receivedEvent = e
		mu.Unlock()
		select {
		case eventReceived <- struct{}{}:
		default:
		}
	})

	// Publish an event
	event := Event{
		Type:    EventApplicationCreated,
		Payload: map[string]string{"test": "data"},
	}
	bus.Publish(event)

	// Wait for event to be received (with timeout)
	select {
	case <-eventReceived:
		// Event received
		mu.Lock()
		evt := receivedEvent
		mu.Unlock()
		if evt.Type != EventApplicationCreated {
			t.Errorf("Expected event type %s, got %s", EventApplicationCreated, evt.Type)
		}
		payload, ok := evt.Payload.(map[string]string)
		if !ok {
			t.Error("Expected payload to be map[string]string")
		}
		if payload["test"] != "data" {
			t.Errorf("Expected payload['test'] to be 'data', got '%s'", payload["test"])
		}
	case <-time.After(1 * time.Second):
		t.Error("Timeout waiting for event to be received")
	}
}

func TestBus_MultipleSubscribers(t *testing.T) {
	bus := Get()
	var receivedCount int
	var mu sync.Mutex
	subscriberCount := 3
	allReceived := make(chan struct{}, 1)

	// Create multiple subscribers
	for i := 0; i < subscriberCount; i++ {
		bus.Subscribe(EventApplicationCreated, func(e Event) {
			mu.Lock()
			receivedCount++
			count := receivedCount
			mu.Unlock()
			if count == subscriberCount {
				select {
				case allReceived <- struct{}{}:
				default:
				}
			}
		})
	}

	// Publish one event
	event := Event{
		Type:    EventApplicationCreated,
		Payload: "test",
	}
	bus.Publish(event)

	// Wait for all subscribers to receive the event
	select {
	case <-allReceived:
		mu.Lock()
		count := receivedCount
		mu.Unlock()
		if count != subscriberCount {
			t.Errorf("Expected %d subscribers to receive event, got %d", subscriberCount, count)
		}
	case <-time.After(1 * time.Second):
		mu.Lock()
		count := receivedCount
		mu.Unlock()
		t.Errorf("Timeout waiting for all subscribers to receive event. Got %d/%d", count, subscriberCount)
	}
}

func TestBus_DifferentEventTypes(t *testing.T) {
	bus := Get()
	var receivedEvents []EventType
	var mu sync.Mutex
	allReceived := make(chan struct{}, 1)

	// Subscribe to different event types
	bus.Subscribe(EventApplicationCreated, func(e Event) {
		mu.Lock()
		receivedEvents = append(receivedEvents, e.Type)
		count := len(receivedEvents)
		mu.Unlock()
		if count == 2 {
			select {
			case allReceived <- struct{}{}:
			default:
			}
		}
	})

	bus.Subscribe(EventApplicationRejected, func(e Event) {
		mu.Lock()
		receivedEvents = append(receivedEvents, e.Type)
		count := len(receivedEvents)
		mu.Unlock()
		if count == 2 {
			select {
			case allReceived <- struct{}{}:
			default:
			}
		}
	})

	// Publish different events
	bus.Publish(Event{Type: EventApplicationCreated, Payload: nil})
	bus.Publish(Event{Type: EventApplicationRejected, Payload: nil})

	// Wait for events
	select {
	case <-allReceived:
		mu.Lock()
		count := len(receivedEvents)
		mu.Unlock()
		if count != 2 {
			t.Errorf("Expected 2 events, got %d", count)
		}
	case <-time.After(1 * time.Second):
		mu.Lock()
		count := len(receivedEvents)
		mu.Unlock()
		t.Errorf("Timeout waiting for events. Got %d/2", count)
	}
}

func TestBus_NonBlockingPublish(t *testing.T) {
	bus := Get()

	// Fill up the channel to test non-blocking behavior
	// Channel has capacity 1000, so we publish more than that
	for i := 0; i < 2000; i++ {
		bus.Publish(Event{
			Type:    EventApplicationCreated,
			Payload: i,
		})
	}

	// If we get here without blocking, the test passes
	// The non-blocking behavior is tested by not hanging
}
