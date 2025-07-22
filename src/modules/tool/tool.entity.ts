import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Integration } from '@modules/integration/integration.entity';

@Entity({ name: 'tool' })
export class Tool {
    @PrimaryColumn()
    action: string;

    @PrimaryColumn({ name: 'integration_key' })
    integrationKey: string;

    @ManyToOne(() => Integration)
    @JoinColumn({ name: 'integration_key' })
    integration?: Integration;

    @Column()
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ name: 'params', type: 'jsonb' })
    params: Record<string, any>;
}
