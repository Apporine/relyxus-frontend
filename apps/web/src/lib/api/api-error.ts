import { z } from 'zod';

/*
 * Errors are RFC 9457 problem details carrying a correlation ID (Product s. 22A). The
 * extension member name `correlationId` is provisional until the OpenAPI contract is
 * published (ADR 0004).
 */
export const problemDetailsSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  status: z.number().int().optional(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  correlationId: z.string().optional(),
});
export type ProblemDetails = z.infer<typeof problemDetailsSchema>;

export const apiErrorKinds = [
  'unauthenticated',
  'forbidden',
  'not-found',
  'conflict',
  'precondition-failed',
  'validation',
  'rate-limited',
  'unavailable',
  'server',
  'network',
  'contract',
] as const;
export type ApiErrorKind = (typeof apiErrorKinds)[number];

const RETRYABLE_KINDS: ReadonlySet<ApiErrorKind> = new Set([
  'network',
  'unavailable',
  'rate-limited',
]);

type ApiErrorDetails = {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  problem?: ProblemDetails;
  retryAfterSeconds?: number;
  cause?: unknown;
};

/**
 * A classified API failure. Screens choose their error state from `kind`, never from the
 * raw status, and show `correlationId` as the support reference (UI/UX s. 9).
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  readonly problem: ProblemDetails | undefined;
  readonly retryAfterSeconds: number | undefined;

  constructor({ kind, message, status, problem, retryAfterSeconds, cause }: ApiErrorDetails) {
    super(message, { cause });
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.problem = problem;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  get correlationId(): string | undefined {
    return this.problem?.correlationId;
  }

  /** Only transient failures are retried; a 4xx answer will not change by asking again. */
  get isRetryable(): boolean {
    return RETRYABLE_KINDS.has(this.kind);
  }
}

export function errorKindForStatus(status: number): ApiErrorKind {
  switch (status) {
    case 401:
      return 'unauthenticated';
    case 403:
      return 'forbidden';
    case 404:
      return 'not-found';
    case 409:
      return 'conflict';
    case 412:
      return 'precondition-failed';
    case 400:
    case 422:
      return 'validation';
    case 429:
      return 'rate-limited';
    case 502:
    case 503:
    case 504:
      return 'unavailable';
    default:
      return 'server';
  }
}
