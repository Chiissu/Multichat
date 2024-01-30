/**
 * Strips all undefined field from a type.
 */
export type DeepStripOptional<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepStripOptional<T[K]> : T[K];
};
