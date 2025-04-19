import { z } from 'zod';

export const CreateEventSchema = z.object({
    title: z.string(),
    description: z.string(),
    start: z.date().optional(),
    end: z.date().optional(),
});

export const ListEventsSchema = z.object({
    start: z.date().optional(),
    end: z.date().optional(),
    maxResults: z.number().optional(),
    orderBy: z.enum(['startTime', 'updated']).optional(),
    showDeleted: z.boolean().optional(),
    singleEvents: z.boolean().optional(),
    timeMin: z.date().optional(),
    timeMax: z.date().optional(),
});
