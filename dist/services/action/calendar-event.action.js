"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCreateCalendarEvent = executeCreateCalendarEvent;
const date_fns_1 = require("date-fns");
async function executeCreateCalendarEvent(action) {
    const config = action.config;
    const title = config.title;
    const start = config.start;
    const durationMinutes = config.durationMinutes || 60;
    const description = config.description || "";
    const location = config.location || "";
    const attendees = config.attendees || [];
    const colorId = config.colorId;
    const calendarId = config.calendarId;
    if (!title) {
        throw new Error("CREATE_CALENDAR_EVENT - Title is required");
    }
    if (!start) {
        throw new Error("CREATE_CALENDAR_EVENT - Start time is required");
    }
    console.log(`📅 [ActionExecutor] CREATE_CALENDAR_EVENT - Title: ${title}, Start: ${start}, Duration: ${durationMinutes} min`);
    try {
        // Parse start time and calculate end time
        const startTime = (0, date_fns_1.parseISO)(start);
        if (isNaN(startTime.getTime())) {
            throw new Error(`Invalid start time format: ${start}. Expected ISO 8601 format.`);
        }
        const endTime = (0, date_fns_1.addMinutes)(startTime, durationMinutes);
        // Prepare event data
        const eventData = {
            summary: title,
            description: description,
            location: location,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: "UTC",
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: "UTC",
            },
            attendees: attendees.map((email) => ({ email })),
            colorId: colorId,
        };
        console.log(`📅 [ActionExecutor] CREATE_CALENDAR_EVENT - Event data prepared: ${JSON.stringify(eventData, null, 2)}`);
        // TODO: Implement actual calendar event creation
        // This requires integration with a calendar service (Google Calendar, Outlook, etc.)
        // 
        // Example for Google Calendar API:
        // const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        // const response = await calendar.events.insert({
        //   calendarId: calendarId || 'primary',
        //   requestBody: eventData,
        // });
        //
        // For now, we log the event data that would be sent
        console.log(`✅ [ActionExecutor] CREATE_CALENDAR_EVENT - Event would be created in calendar ${calendarId || "primary"}`);
        console.log(`   Start: ${(0, date_fns_1.format)(startTime, "yyyy-MM-dd HH:mm")}, End: ${(0, date_fns_1.format)(endTime, "yyyy-MM-dd HH:mm")}`);
        if (attendees.length > 0) {
            console.log(`   Attendees: ${attendees.join(", ")}`);
        }
        // Note: To implement this fully, you would need to:
        // 1. Set up OAuth2 for Google Calendar (or similar for other providers)
        // 2. Store calendar credentials securely
        // 3. Make API calls to create the event
        // 4. Handle errors and retries
    }
    catch (error) {
        console.error(`❌ [ActionExecutor] CREATE_CALENDAR_EVENT - Error:`, error);
        throw new Error(`Failed to create calendar event: ${error.message}`);
    }
}
//# sourceMappingURL=calendar-event.action.js.map