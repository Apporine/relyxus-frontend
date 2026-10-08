import type { z } from 'zod';

import {
  ApiError,
  errorKindForStatus,
  problemDetailsSchema,
  type ProblemDetails,
} from './api-error';

/*
 * The console reaches the API on the same origin (ingress routes /api to the FastAPI
 * service), so no cross-origin requests or credentials configuration are needed in any
 * deployment mode.
 */
const API_BASE_PATH = '/api/v1';
const NO_CONTENT_STATUS = 204;

export type QueryParameterValue = string | number | boolean | readonly string[] | undefined;

export type ApiRequest<ResponseSchema extends z.ZodType> = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Path below /api/v1, starting with a slash, for example "/workspaces/payments-uk/incidents". */
  path: string;
  query?: Record<string, QueryParameterValue>;
  body?: unknown;
  /** Every response is validated at the boundary so contract drift fails loudly. */
  responseSchema: ResponseSchema;
  /**
   * Required on requests that create a record or act on a target. Generate it once per
   * user intent with newIdempotencyKey() and reuse it for retries of that intent.
   */
  idempotencyKey?: string;
  /** ETag of the version being edited; a newer server version produces a precondition failure. */
  ifMatch?: string;
  signal?: AbortSignal;
};

export type ApiResponse<Data> = {
  data: Data;
  /** Version tag to send back as `ifMatch` when updating this resource. */
  etag: string | undefined;
};

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

function buildUrl(path: string, query: ApiRequest<z.ZodType>['query']): string {
  const searchParameters = new URLSearchParams();
  for (const [name, value] of Object.entries(query ?? {})) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => searchParameters.append(name, item));
    } else {
      searchParameters.append(name, String(value));
    }
  }
  const queryString = searchParameters.toString();
  return `${API_BASE_PATH}${path}${queryString === '' ? '' : `?${queryString}`}`;
}

function buildHeaders({ body, idempotencyKey, ifMatch }: ApiRequest<z.ZodType>): Headers {
  const headers = new Headers({ Accept: 'application/json, application/problem+json' });
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (idempotencyKey !== undefined) {
    headers.set('Idempotency-Key', idempotencyKey);
  }
  if (ifMatch !== undefined) {
    headers.set('If-Match', ifMatch);
  }
  return headers;
}

/** Retry-After may be delay seconds or an HTTP date (RFC 9110). */
function parseRetryAfterSeconds(retryAfterHeader: string | null): number | undefined {
  if (retryAfterHeader === null) {
    return undefined;
  }
  const delaySeconds = Number(retryAfterHeader);
  if (Number.isFinite(delaySeconds)) {
    return Math.max(0, delaySeconds);
  }
  const retryAt = Date.parse(retryAfterHeader);
  return Number.isNaN(retryAt) ? undefined : Math.max(0, Math.ceil((retryAt - Date.now()) / 1_000));
}

async function readProblemDetails(response: Response): Promise<ProblemDetails | undefined> {
  const contentType = response.headers.get('Content-Type') ?? '';
  if (!contentType.includes('json')) {
    return undefined;
  }
  const parsedProblem = problemDetailsSchema.safeParse(
    await response.json().catch(() => undefined),
  );
  return parsedProblem.success ? parsedProblem.data : undefined;
}

async function failedResponseError(response: Response): Promise<ApiError> {
  const problem = await readProblemDetails(response);
  return new ApiError({
    kind: errorKindForStatus(response.status),
    message: problem?.title ?? `Request failed with status ${response.status}`,
    status: response.status,
    problem,
    retryAfterSeconds: parseRetryAfterSeconds(response.headers.get('Retry-After')),
  });
}

type ContractIssue = { path: ReadonlyArray<PropertyKey> };

function contractError(path: string, issues: ReadonlyArray<ContractIssue>): ApiError {
  // Only field paths are reported; response values may hold sensitive incident data.
  const issuePaths = issues.map((issue) => issue.path.map(String).join('.') || '(root)').join(', ');
  return new ApiError({
    kind: 'contract',
    message: `Response from ${path} did not match the expected contract at: ${issuePaths}`,
  });
}

export async function requestApi<ResponseSchema extends z.ZodType>(
  request: ApiRequest<ResponseSchema>,
): Promise<ApiResponse<z.infer<ResponseSchema>>> {
  const { method = 'GET', path, query, body, responseSchema, signal } = request;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: buildHeaders(request),
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      signal,
    });
  } catch (networkFailure) {
    if (signal?.aborted) {
      throw networkFailure;
    }
    throw new ApiError({
      kind: 'network',
      message: `Could not reach the Relyxus API for ${path}`,
      cause: networkFailure,
    });
  }

  if (!response.ok) {
    throw await failedResponseError(response);
  }

  const responseBody = response.status === NO_CONTENT_STATUS ? undefined : await response.json();
  const parsedBody = responseSchema.safeParse(responseBody);
  if (!parsedBody.success) {
    throw contractError(path, parsedBody.error.issues);
  }

  return { data: parsedBody.data, etag: response.headers.get('ETag') ?? undefined };
}
