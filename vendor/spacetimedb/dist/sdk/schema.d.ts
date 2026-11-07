import type { ParamsObj } from '../lib/reducers';
import { type TablesToSchema, type UntypedSchemaDef } from '../lib/schema';
import type { UntypedTableSchema } from '../lib/table_schema';
declare class Tables<S extends UntypedSchemaDef> {
    readonly schemaType: S;
    constructor(schemaType: S);
}
/**
 * Creates a schema from table definitions
 * @param handles - Array of table handles created by table() function
 * @returns ColumnBuilder representing the complete database schema
 * @example
 * ```ts
 * const spacetimedb = schema({
 *   user: table({}, userType),
 *   post: table({}, postType)
 * });
 * ```
 */
export declare function schema<const H extends Record<string, UntypedTableSchema>>(tables: H): Tables<TablesToSchema<H>>;
/**
 * Attaches a view's params to its table, so the query builder queries it by
 * calling it with args. Used by generated bindings for views with args.
 */
export declare function withViewParams<const T extends UntypedTableSchema, const Params extends ParamsObj>(table: T, params: Params): T & {
    readonly viewParams: Params;
};
type HasAccessor = {
    accessorName: PropertyKey;
};
export type ConvertToAccessorMap<TableDefs extends readonly HasAccessor[]> = {
    [Tbl in TableDefs[number] as Tbl['accessorName']]: Tbl;
};
export declare function convertToAccessorMap<T extends readonly HasAccessor[]>(arr: T): ConvertToAccessorMap<T>;
export {};
//# sourceMappingURL=schema.d.ts.map