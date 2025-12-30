package eventbus

import "sync"

type Listener func(Event)

type Bus struct {
	listeners map[EventType][]Listener
	publishCh chan Event
	mu        sync.RWMutex
}

var (
	instance *Bus
	once     sync.Once
)

func Get() *Bus {
	once.Do(func() {
		instance = &Bus{
			listeners: make(map[EventType][]Listener),
			publishCh: make(chan Event, 1000),
		}
		go instance.run()
	})
	return instance
}

func (b *Bus) Publish(e Event) {
	// Non-blocking om det finns plats, annars blockerar vi lite (backpressure)
	select {
	case b.publishCh <- e:
	default:
		go func() { b.publishCh <- e }()
	}
}

func (b *Bus) Subscribe(t EventType, l Listener) {
	b.mu.Lock()
	b.listeners[t] = append(b.listeners[t], l)
	b.mu.Unlock()
}

func (b *Bus) run() {
	for e := range b.publishCh {
		b.mu.RLock()
		listeners := b.listeners[e.Type]
		b.mu.RUnlock()

		for _, listener := range listeners {
			go listener(e) // varje listener i egen goroutine
		}
	}
}
