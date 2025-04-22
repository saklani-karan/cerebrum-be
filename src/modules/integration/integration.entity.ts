import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'integration' })
export class Integration {
    @PrimaryColumn()
    key: string;

    @Column()
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text', nullable: true })
    iconUrl?: string;
}
