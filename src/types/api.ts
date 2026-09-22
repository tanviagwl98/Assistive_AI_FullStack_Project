export interface Pagination { page: number; limit: number; total: number; totalPages: number; }
export interface ApiData<T> { data: T; }
export interface ApiCollection<T> extends ApiData<T[]> { pagination: Pagination; }
