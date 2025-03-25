import { init, captureConsoleIntegration } from '@sentry/nestjs';

init({
    dsn: process.env.DSN,
    integrations: [captureConsoleIntegration({ levels: ['log', 'warn', 'error'] })],
    environment: process.env.NODE_ENV,
});
