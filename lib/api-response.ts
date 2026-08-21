/** Shared JSON response helpers for CrowdShield API routes. */
export type DataSource = 'mock' | 'supabase'

export type ApiMeta = {
  source: DataSource
  generatedAt: string
}

export type ApiResponse<T> = {
  data: T
  meta: ApiMeta
}

export function apiResponse<T>(data: T, source: DataSource): ApiResponse<T> {
  return {
    data,
    meta: {
      source,
      generatedAt: new Date().toISOString(),
    },
  }
}

export function mockResponse<T>(data: T): ApiResponse<T> {
  return apiResponse(data, 'mock')
}
