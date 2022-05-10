import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'

export default function setupSentry(app) {
  return {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: app
      ? [
          new Sentry.Integrations.Http({ tracing: true }),
          new Tracing.Integrations.Express({ app }),
        ]
      : [],
    tracesSampleRate: 1,
  }
}
