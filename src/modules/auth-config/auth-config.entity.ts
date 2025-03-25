import { BaseEntity } from '@modules/base/base.entity';
import { User } from '@modules/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export class OAuthConfig {
    refreshToken: string;
    accessToken: string;
    expirationAt?: Date;
}

export class SimpleConfig {
    password: string;
}

export type CredentialsConfig = OAuthConfig | SimpleConfig;

@Entity({ name: 'auth_config' })
export class AuthConfig extends BaseEntity {
    identifier: string = 'auth_config';

    @Column({ name: 'provider', type: 'varchar' })
    provider: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id', type: 'varchar' })
    userId: string;

    @Column({ name: 'config', type: 'jsonb' })
    config: CredentialsConfig;
}
