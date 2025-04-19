import { z } from 'zod';
import { IntegrationMetadata, ToolMetadata } from '../../decorators';
import { CreateEventSchema, ListEventsSchema } from './schema';
import { IntegrationExecutable } from '../../types';

@IntegrationMetadata.define({
    name: 'Google Calendar',
    description: 'Integration for creating and managing Google Calendar events',
    key: 'google_calendar',
})
export default class GoogleCalendarIntegration extends IntegrationExecutable {
    constructor() {
        super();
    }

    @ToolMetadata.define({
        name: 'Create Event',
        description: 'Create a new event in Google Calendar',
        schema: CreateEventSchema,
    })
    protected create(params: z.infer<typeof CreateEventSchema>) {
        console.log(params);
    }

    @ToolMetadata.define({
        name: 'List Events',
        description: 'List all events from Google Calendar',
        schema: ListEventsSchema,
    })
    protected list(params: z.infer<typeof ListEventsSchema>) {
        console.log(params);
    }
}
