import {
  parseScanUrl,
  URL_ERROR_MESSAGES,
  type ApiError,
  type CreateScanResponse,
  type ScanJob,
} from '@whc/shared';
import type { FastifyPluginAsync } from 'fastify';
import { config } from '../config.js';
import { BlockedAddressError, assertAllowedUrl } from '../net/ssrf.js';
import { renderReportPdf } from '../pdf/render-pdf.js';
import { QueueFullError, type ScanService } from '../scan/scan-service.js';

export const scanRoutes =
  (service: ScanService): FastifyPluginAsync =>
  async (app) => {
    app.post<{ Body: { url?: unknown }; Reply: CreateScanResponse | ApiError }>(
      '/scans',
      {
        config: {
          rateLimit: {
            max: config.rateLimit.max,
            timeWindow: config.rateLimit.timeWindow,
          },
        },
        schema: {
          body: {
            type: 'object',
            required: ['url'],
            properties: { url: { type: 'string', maxLength: 2048 } },
          },
        },
      },
      async (request, reply) => {
        const parsed = parseScanUrl(String(request.body.url ?? ''));
        if (!parsed.ok)
          return reply.code(400).send({ error: URL_ERROR_MESSAGES[parsed.reason] });

        const host = parsed.hostname.toLowerCase();
        if (
          config.blockedHosts.some(
            (blocked) => host === blocked || host.endsWith(`.${blocked}`),
          )
        ) {
          return reply
            .code(403)
            .send({ error: 'The owner of this website has asked not to be scanned.' });
        }

        try {
          assertAllowedUrl(parsed.url);
        } catch (error) {
          if (error instanceof BlockedAddressError) {
            return reply
              .code(400)
              .send({ error: 'Only public websites can be scanned.' });
          }
          throw error;
        }

        try {
          const job = service.create(parsed.url);
          return reply.code(202).send({ id: job.id });
        } catch (error) {
          if (error instanceof QueueFullError) {
            return reply.code(503).send({
              error: 'We’re busy scanning other websites. Please try again in a minute.',
            });
          }
          throw error;
        }
      },
    );

    app.get<{ Params: { id: string }; Reply: ScanJob | ApiError }>(
      '/scans/:id',
      async (request, reply) => {
        const job = service.get(request.params.id);
        if (!job) {
          return reply.code(404).send({
            error:
              'This report has expired or does not exist. Reports are kept for 30 minutes.',
          });
        }
        reply.header('cache-control', 'no-store');
        return job;
      },
    );

    app.get<{ Params: { id: string }; Reply: Buffer | ApiError }>(
      '/scans/:id/pdf',
      {
        config: {
          rateLimit: {
            max: config.rateLimit.max * 2,
            timeWindow: config.rateLimit.timeWindow,
          },
        },
      },
      async (request, reply) => {
        const job = service.get(request.params.id);
        if (!job) {
          return reply.code(404).send({
            error:
              'This report has expired or does not exist. Reports are kept for 30 minutes.',
          });
        }
        if (job.status !== 'complete' || !job.report) {
          return reply.code(409).send({ error: 'The report is not ready yet.' });
        }

        const hostname = new URL(job.report.url).hostname;
        try {
          const pdf = await renderReportPdf(job.id, hostname);
          return reply
            .header('content-type', 'application/pdf')
            .header(
              'content-disposition',
              `attachment; filename="health-report-${hostname}.pdf"`,
            )
            .header('cache-control', 'no-store')
            .send(pdf);
        } catch (error) {
          request.log.error(error, 'PDF rendering failed');
          return reply.code(503).send({
            error: 'We couldn’t prepare the PDF right now. Please try again in a moment.',
          });
        }
      },
    );
  };
