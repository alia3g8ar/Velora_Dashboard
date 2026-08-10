// MySQL comparison compatibility patch.
//
// This module is intentionally loaded via dynamic import from inside the
// guarded bootstrap (see src/main.ts) rather than at entrypoint evaluation
// time: it reaches into the private `src/` path of
// @ptc-org/nestjs-query-typeorm, which has no public export for
// SQLComparisonBuilder, so nothing that can throw here may execute before the
// bootstrap error handler is active.
import { SQLComparisonBuilder } from '@ptc-org/nestjs-query-typeorm/src/query/sql-comparison.builder';

// The Refine data provider maps its `contains` operator to `iLike`. nestjs-query
// emits Postgres-only `ILIKE` for that comparison, which MySQL rejects. MySQL's
// `LIKE` is already case-insensitive for the default collations, so remapping
// `iLike`/`notILike` to `LIKE`/`NOT LIKE` is semantically correct here.
SQLComparisonBuilder.DEFAULT_COMPARISON_MAP.ilike = 'LIKE';
SQLComparisonBuilder.DEFAULT_COMPARISON_MAP.notilike = 'NOT LIKE';

export {};
