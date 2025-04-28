import { BaseEntity } from '@modules/base/base.entity';
import { Integration } from '@modules/integration/integration.entity';
import { User } from '@modules/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum IntegrationCredentialsType {
    OAUTH2 = 'oauth2',
    API_KEY = 'api_key',
}

export interface IntegrationCredentials {
    type: IntegrationCredentialsType;
    expiresAt: Date;
}

export class OAuth2Credentials implements IntegrationCredentials {
    type: IntegrationCredentialsType.OAUTH2;
    refreshToken: string;
    accessToken: string;
    expiresAt: Date;
}

export class ApiKeyCredentials implements IntegrationCredentials {
    type: IntegrationCredentialsType.API_KEY;
    key: string;
    expiresAt: Date;
}

@Entity('integration_auth')
export class IntegrationAuth extends BaseEntity {
    identifier = 'integration_auth';

    @ManyToOne(() => Integration)
    @JoinColumn({ name: 'integration_key' })
    integration: Integration;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'integration_key' })
    integrationKey: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'credentials', type: 'jsonb' })
    credentials: IntegrationCredentials;

    @Column({ name: 'account_id' })
    accountId: string;

    @Column({ name: 'display_name' })
    displayName: string;

    @Column({ name: 'profile_image_url', nullable: true })
    profileImageUrl: string;
}
