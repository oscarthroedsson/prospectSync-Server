import { ActionDefinition } from "../../models/action.model";
import { parseISO, addMinutes, format } from "date-fns";

export async function executeCreateCalendarEvent(
  action: ActionDefinition
): Promise<void> {
  const config = action.config;

  const title = config.title as string;
  const start = config.start as string;
  const durationMinutes = (config.durationMinutes as number) || 60;
  const description = (config.description as string) || "";
  const location = (config.location as string) || "";
  const attendees = (config.attendees as string[]) || [];
  const colorId = config.colorId as string;
  const calendarId = config.calendarId as string;

  if (!title) {
    throw new Error("CREATE_CALENDAR_EVENT - Title is required");
  }

  if (!start) {
    throw new Error("CREATE_CALENDAR_EVENT - Start time is required");
  }

  console.log(
    `📅 [ActionExecutor] CREATE_CALENDAR_EVENT - Title: ${title}, Start: ${start}, Duration: ${durationMinutes} min`
  );

  try {
    // Parse start time and calculate end time
    const startTime = parseISO(start);
    if (isNaN(startTime.getTime())) {
      throw new Error(`Invalid start time format: ${start}. Expected ISO 8601 format.`);
    }

    const endTime = addMinutes(startTime, durationMinutes);

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

    console.log(
      `📅 [ActionExecutor] CREATE_CALENDAR_EVENT - Event data prepared: ${JSON.stringify(eventData, null, 2)}`
    );

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
    console.log(
      `✅ [ActionExecutor] CREATE_CALENDAR_EVENT - Event would be created in calendar ${calendarId || "primary"}`
    );
    console.log(
      `   Start: ${format(startTime, "yyyy-MM-dd HH:mm")}, End: ${format(endTime, "yyyy-MM-dd HH:mm")}`
    );
    if (attendees.length > 0) {
      console.log(`   Attendees: ${attendees.join(", ")}`);
    }

    // Note: To implement this fully, you would need to:
    // 1. Set up OAuth2 for Google Calendar (or similar for other providers)
    // 2. Store calendar credentials securely
    // 3. Make API calls to create the event
    // 4. Handle errors and retries
  } catch (error: any) {
    console.error(`❌ [ActionExecutor] CREATE_CALENDAR_EVENT - Error:`, error);
    throw new Error(`Failed to create calendar event: ${error.message}`);
  }
}
