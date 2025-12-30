package listeners

import "your-project/internal/eventbus"

func StartAll(bus *eventbus.Bus) {
	// add all listeners ex
	// EmailListener(bus)
}

/*
EXAMPLE HOW TO BUILD A LISTENER
func EmailListener(bus *eventbus.Bus) {
	bus.Subscribe(eventbus.EventApplicationCreated, func(e eventbus.Event) {
		p := e.Payload.(map[string]any)
		email.SendWelcome(p["email"].(string), p["name"].(string))
	})

	bus.Subscribe(eventbus.EventApplicationStageChanged, func(e eventbus.Event) {
		p := e.Payload.(map[string]any)
		if p["new_stage"] == "Telefonavstämning" {
			email.SendPhoneScreening(p["email"].(string), p["job_title"].(string))
		}
	})
}
*/
