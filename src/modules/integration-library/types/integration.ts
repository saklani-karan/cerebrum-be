export interface IntegrationAuthenticationCredentials {
    expirationAt: Date;
}

export interface IntegrationInterface<
    AuthenticationCredentials extends
        IntegrationAuthenticationCredentials = IntegrationAuthenticationCredentials,
> {
    authenticate(): Promise<AuthenticationCredentials>;
}
