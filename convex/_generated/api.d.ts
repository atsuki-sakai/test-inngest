/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as files from "../files.js";
import type * as generate_mutation from "../generate/mutation.js";
import type * as generate_query from "../generate/query.js";
import type * as http from "../http.js";
import type * as scraping from "../scraping.js";
import type * as task_mutation from "../task/mutation.js";
import type * as task_query from "../task/query.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  files: typeof files;
  "generate/mutation": typeof generate_mutation;
  "generate/query": typeof generate_query;
  http: typeof http;
  scraping: typeof scraping;
  "task/mutation": typeof task_mutation;
  "task/query": typeof task_query;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
