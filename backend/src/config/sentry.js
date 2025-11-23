/**
 * Sentry Error Tracking Configuration
 *
 * Integrates Sentry for error monitoring and performance tracking.
 *
 * Usage:
 *   const { initSentry, captureException } = require('./config/sentry');
 *
 *   // Initialize in server.js
 *   initSentry(app);
 *
 *   // Capture exception
 *   captureException(error, { user: { id: '123' } });
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const { monitoring, server } = require('./env.config');

/**
 * Initialize Sentry
 */
function initSentry(app) {
  if (!monitoring.sentry.enabled) {
    console.log('📊 Sentry error tracking: Disabled');
    return null;
  }

  if (!monitoring.sentry.dsn) {
    console.warn('⚠️  Sentry enabled but DSN not configured');
    return null;
  }

  try {
    Sentry.init({
      dsn: monitoring.sentry.dsn,
      environment: monitoring.sentry.environment,
      tracesSampleRate: monitoring.sentry.tracesSampleRate,

      // Performance Monitoring
      profilesSampleRate: 1.0,
      integrations: [
        // Express integration
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
        new ProfilingIntegration(),
      ],

      // Release tracking
      release: process.env.SENTRY_RELEASE || `lms-backend@${process.env.npm_package_version}`,

      // Before send hook to filter/modify events
      beforeSend(event, hint) {
        // Don't send certain errors in development
        if (server.isDevelopment) {
          const error = hint.originalException;
          if (error && error.message && error.message.includes('ValidationError')) {
            return null; // Don't send validation errors in dev
          }
        }

        // Scrub sensitive data
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers.authorization;
            delete event.request.headers.cookie;
          }
        }

        return event;
      },

      // Ignore certain errors
      ignoreErrors: [
        'NetworkError',
        'Non-Error exception captured',
        'Non-Error promise rejection captured',
      ],
    });

    console.log('✅ Sentry error tracking initialized');
    console.log(`   Environment: ${monitoring.sentry.environment}`);
    console.log(`   Traces Sample Rate: ${monitoring.sentry.tracesSampleRate * 100}%`);

    return Sentry;
  } catch (error) {
    console.error('❌ Sentry initialization failed:', error.message);
    return null;
  }
}

/**
 * Get Sentry request handler middleware
 */
function getSentryRequestHandler() {
  if (monitoring.sentry.enabled) {
    return Sentry.Handlers.requestHandler();
  }
  return (req, res, next) => next();
}

/**
 * Get Sentry tracing handler middleware
 */
function getSentryTracingHandler() {
  if (monitoring.sentry.enabled) {
    return Sentry.Handlers.tracingHandler();
  }
  return (req, res, next) => next();
}

/**
 * Get Sentry error handler middleware
 */
function getSentryErrorHandler() {
  if (monitoring.sentry.enabled) {
    return Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Capture all errors with status code >= 500
        return error.statusCode >= 500;
      },
    });
  }
  return (error, req, res, next) => next(error);
}

/**
 * Capture exception with context
 */
function captureException(error, context = {}) {
  if (!monitoring.sentry.enabled) return;

  Sentry.withScope((scope) => {
    // Add context
    if (context.user) {
      scope.setUser(context.user);
    }

    if (context.tags) {
      Object.keys(context.tags).forEach((key) => {
        scope.setTag(key, context.tags[key]);
      });
    }

    if (context.extra) {
      Object.keys(context.extra).forEach((key) => {
        scope.setExtra(key, context.extra[key]);
      });
    }

    if (context.level) {
      scope.setLevel(context.level);
    }

    // Capture exception
    Sentry.captureException(error);
  });
}

/**
 * Capture message with context
 */
function captureMessage(message, level = 'info', context = {}) {
  if (!monitoring.sentry.enabled) return;

  Sentry.withScope((scope) => {
    scope.setLevel(level);

    if (context.user) {
      scope.setUser(context.user);
    }

    if (context.tags) {
      Object.keys(context.tags).forEach((key) => {
        scope.setTag(key, context.tags[key]);
      });
    }

    if (context.extra) {
      Object.keys(context.extra).forEach((key) => {
        scope.setExtra(key, context.extra[key]);
      });
    }

    Sentry.captureMessage(message);
  });
}

/**
 * Set user context for all subsequent events
 */
function setUser(user) {
  if (!monitoring.sentry.enabled) return;

  Sentry.setUser({
    id: user.id || user._id,
    email: user.email,
    username: user.name,
  });
}

/**
 * Clear user context
 */
function clearUser() {
  if (!monitoring.sentry.enabled) return;
  Sentry.setUser(null);
}

/**
 * Add breadcrumb
 */
function addBreadcrumb(breadcrumb) {
  if (!monitoring.sentry.enabled) return;

  Sentry.addBreadcrumb({
    message: breadcrumb.message,
    category: breadcrumb.category || 'custom',
    level: breadcrumb.level || 'info',
    data: breadcrumb.data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start transaction for performance monitoring
 */
function startTransaction(name, op) {
  if (!monitoring.sentry.enabled) return null;

  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Capture checkpoint for performance monitoring
 */
function captureCheckpoint(transaction, name) {
  if (!transaction) return;

  transaction.startChild({
    op: 'checkpoint',
    description: name,
  });
}

module.exports = {
  Sentry,
  initSentry,
  getSentryRequestHandler,
  getSentryTracingHandler,
  getSentryErrorHandler,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  startTransaction,
  captureCheckpoint,
};
