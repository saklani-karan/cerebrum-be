import { UpdateIntegration } from './update-integration';

export type ToolIdentifier = `${string}-${string}`;

export type UpdateManyIntegrationRequest = Record<ToolIdentifier, UpdateIntegration>;
