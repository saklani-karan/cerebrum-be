import { z } from 'zod';
import { GoogleCalendarAuthenticationCredentials } from './types';
import { ToolDefinitionTemplate } from '@modules/integration-library/types/tool';
import GoogleCalendarIntegration from './integration';
import { IntegrationReference, ToolMetadata } from '../../decorators';

export const CreateEventSchema = z.object({
    title: z.string(),
    description: z.string(),
    start: z.date().optional(),
    end: z.date().optional(),
});

type CreateEventInput = z.infer<typeof CreateEventSchema>;
type CreateEventOutput = z.infer<typeof CreateEventSchema>;

@ToolMetadata.define({
    name: 'Create Event',
    description: 'Create an event in Google Calendar',
    schema: CreateEventSchema,
    key: 'create-event',
})
export default class CreateEventTool extends ToolDefinitionTemplate<
    CreateEventInput,
    CreateEventOutput,
    GoogleCalendarAuthenticationCredentials
> {
    @IntegrationReference.define(() => GoogleCalendarIntegration)
    protected integration: GoogleCalendarIntegration;

    constructor(integration: GoogleCalendarIntegration) {
        super(integration);
    }

    protected async execute(params: CreateEventInput): Promise<CreateEventOutput> {
        this.logger.log('Creating event', params);
        return params;
    }
}
