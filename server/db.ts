import * as schema from "@shared/schema";
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Deep clean function to remove all undefined values recursively
function deepCleanValue(value: any): any {
  if (value === null || value === undefined) {
    return null; // Convert undefined to null for postgres
  }
  if (Array.isArray(value)) {
    return value.map(v => deepCleanValue(v)).filter(v => v !== undefined);
  }
  if (typeof value === 'object' && value.constructor === Object) {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      const cleanedVal = deepCleanValue(v);
      if (cleanedVal !== undefined) {
        cleaned[k] = cleanedVal;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  return value;
}

// Use postgres-js driver for both dev and production
// It works with both Neon and standard PostgreSQL connections
const sql = postgres(process.env.DATABASE_URL);

// Create a wrapper function that cleans parameters before passing to postgres
const originalSqlFunction = sql;
const wrappedSql = function(strings: any, ...values: any[]) {
  // Clean all parameter values recursively before they reach postgres
  const cleanedValues = values.map((v: any) => deepCleanValue(v));
  return originalSqlFunction.call(this, strings, ...cleanedValues);
} as any;

// Copy all properties and methods from original sql to wrapped version
Object.setPrototypeOf(wrappedSql, Object.getPrototypeOf(originalSqlFunction));
Object.assign(wrappedSql, originalSqlFunction);
for (const key of Object.getOwnPropertyNames(originalSqlFunction)) {
  try {
    wrappedSql[key] = originalSqlFunction[key];
  } catch (e) {
    // Some properties may be non-configurable
  }
}

export const db = drizzle({ client: wrappedSql, schema });
export const rawSql = wrappedSql;
