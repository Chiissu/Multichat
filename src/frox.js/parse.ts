import { BaseSchema, safeParse as valiParse } from "valibot";
import { DeepStripOptional } from "./types";
import { Err, Ok, Result } from "ts-results";

/**
 * Wraps Valibot's safeParse result in ts-result
 * @argument schema The Valibot schema for data to be validated against
 * @argument value The data to validate
 */
export function safeParse<T>(schema: BaseSchema<T>, value: unknown) {
  let parseResult = valiParse(schema, value);
  let result: Result<T, "InvalidType">;
  if (!parseResult.success) {
    result = Err("InvalidType");
  } else {
    result = Ok(parseResult.output);
  }
  return {
    ...reexportResult(result),
    ...result,
    /**
     * Fill all optional fields with a default value
     * @argument defaultConfigs The default config to merge into
     */
    addDefault: (defaultConfigs: DeepStripOptional<T>) => {
      let defaultedResult = result.map((val) => {
        return mergeConfig(val, defaultConfigs);
      });
      return {
        ...reexportResult(defaultedResult),
        ...defaultedResult,
        /**
         * Returns the contained Ok value or the supplied default
         * @argument handler Callback when the result is invalid
         */
        unwrapOrDefault: (handler?: () => any) => {
          if (defaultedResult.ok) return defaultedResult.val;
          handler && handler();
          return defaultConfigs;
        },
      };
    },
  };
}

function reexportResult<T, E>(result: Result<T, E>) {
  return {
    andThen: result.andThen,
    expect: result.expect,
    map: result.map,
    mapErr: result.mapErr,
    toOption: result.toOption,
    toString: result.toString,
    unwrap: result.unwrap,
    unwrapOr: result.unwrapOr,
  };
}

export function mergeConfig<T>(
  config: T,
  defaultConfig: DeepStripOptional<T>,
): DeepStripOptional<T> {
  return {
    ...config,
    ...defaultConfig,
  };
}
