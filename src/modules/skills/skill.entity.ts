import { BaseEntity } from '@modules/base/base.entity';
import { IntegrationAuth } from '@modules/integration-auth/integration-auth.entity';
import { Integration } from '@modules/integration/integration.entity';
import { Tool } from '@modules/tool/tool.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'skill' })
export class Skill extends BaseEntity {
    identifier: string = 'skill';

    @ManyToOne(() => IntegrationAuth)
    @JoinColumn({ name: 'integration_auth_id' })
    integrationAuth: IntegrationAuth;

    @Column({ name: 'integration_auth_id' })
    integrationAuthId: string;

    @ManyToOne(() => Integration)
    @JoinColumn({ name: 'integration_key' })
    integration: Integration;

    @Column({ name: 'integration_key' })
    integrationKey: string;

    @ManyToOne(() => Tool)
    @JoinColumn({ name: 'tool_id' })
    tool: Tool;

    @Column({ name: 'tool_id' })
    toolId: string;

    @Column({ name: 'name' })
    name: string;

    @Column({ name: 'description' })
    description: string;

    @Column({ name: 'defined_params', type: 'jsonb' })
    preDefinedParams: Record<string, any>;
}
