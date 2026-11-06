import path from 'node:path';
import { ZodError } from 'zod';
import { createRoutes } from './routes.js';
import { checkDatabaseReady } from '@newsdc/db';
import express from 'express';
import { randomUUID } from 'node:crypto';
export function createApp({ db, logger = console, adminKey, staticDirectory } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.set('X-Request-Id', req.requestId);
    res.on('finish', () =>
      logger.info(
        JSON.stringify({
          event: 'http_request',
          requestId: req.requestId,
          method: req.method,
          status: res.statusCode,
        }),
      ),
    );
    next();
  });
  app.get('/api/v1/health/live', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/v1/health/ready', async (_req, res) => {
    try {
      await checkDatabaseReady(db);
      res.json({ status: 'ok', database: 'ready' });
    } catch {
      res.status(503).json({
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Database is unavailable or migrations are pending.',
          details: [],
        },
      });
    }
  });
  app.use(express.json({ limit: '1mb' }));
  const { router } = createRoutes(db, { adminKey, logger });
  app.use('/api/v1', router);
  if (staticDirectory) {
    app.use(express.static(staticDirectory));
    app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) =>
      res.sendFile(path.join(staticDirectory, 'index.html')),
    );
  }
  app.use((_req, res) =>
    res
      .status(404)
      .json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found.', details: [] } }),
  );
  app.use((error, req, res, _next) => {
    if (error instanceof ZodError)
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Check the request filters or fields.',
          details: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
      });
    if (error.type === 'entity.too.large')
      return res.status(413).json({
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.', details: [] },
      });
    if (error instanceof SyntaxError && error.status === 400)
      return res.status(400).json({
        error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.', details: [] },
      });
    if (error.code === 'P2025')
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Record not found.', details: [] } });
    if (['P1001', 'P1002', 'P1017'].includes(error.code))
      return res.status(503).json({
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Database is temporarily unavailable.',
          details: [],
        },
      });
    logger.error(JSON.stringify({ event: 'request_failed', requestId: req.requestId }));
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.', details: [] },
    });
  });
  return app;
}
