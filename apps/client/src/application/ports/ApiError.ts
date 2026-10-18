import type { ApiErrorBody } from './apiTypes';

/** Error returned by the API (or a network failure, with `status` 0). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody | null,
  ) {
    super(body?.message ?? (status === 0 ? 'errors.network' : `HTTP ${status}`));
    this.name = 'ApiError';
  }

  get code() {
    return this.body?.code;
  }
}
