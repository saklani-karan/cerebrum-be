import { z } from 'zod';
import { ToolDefinitionTemplate } from '@modules/integration-library/types/tool';
import GoogleCalendarIntegration from './calendar.integration';
import { IntegrationReference, ToolMetadata } from '../../../decorators';
import { IntegrationCredentials } from '@modules/integration-auth/integration-auth.entity';

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
    CreateEventOutput
> {
    @IntegrationReference.define(() => GoogleCalendarIntegration)
    protected integration: GoogleCalendarIntegration;

    constructor(integration: GoogleCalendarIntegration) {
        super(integration);
    }

    protected async execute(
        params: CreateEventInput,
        credentials: IntegrationCredentials,
    ): Promise<CreateEventOutput> {
        this.logger.log('Creating event', params, credentials);
        return params;
    }
}
