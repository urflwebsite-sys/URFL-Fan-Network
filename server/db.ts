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
    return value.map(v => deepCleanValue(v));
  }
  if (typeof value === 'object' && value.constructor === Object) {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      const cleanedVal = deepCleanValue(v);
      if (cleanedVal !== undefined) {
        cleaned[k] = cleanedVal;
      }
    }
    return cleaned;
  }
  return value;
}

// Use postgres-js driver for both dev and production
// It works with both Neon and standard PostgreSQL connections
const sql = postgres(process.env.DATABASE_URL);

// Wrap the sql function to clean all parameters before they reach the driver
const originalSql = sql;
// @ts-expect-error - Proxy type compatibility issue, but works at runtime
const cleaningSql: any = new Proxy(originalSql, {
  apply(target, thisArg, args: any[]) {
    // Clean template literal values
    if (Array.isArray(args[0])) {
      const values = args.slice(1).map((v: any) => deepCleanValue(v));
      // @ts-expect-error - Runtime compatible, type checking limitation
      return target.apply(thisArg, [args[0], ...values]);
    }
    return target.apply(thisArg, args);
  },
});

// Copy properties from original sql to the proxy
Object.assign(cleaningSql, originalSql);

export const db = drizzle({ client: sql, schema });
export const rawSql = cleaningSql;
