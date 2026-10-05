import { FieldConfig } from "./controls";

export interface ApiPayload {
  endpoint: string;
  method: string;
  params: Record<string, unknown>;
}

export function generatePayload(
  fields: FieldConfig[],
  values: Record<string, unknown>,
  endpoint: string,
  method: string
): ApiPayload {
  const params: Record<string, unknown> = {};

  for (const field of fields) {
    const value = values[field.paramName];
    if (value !== undefined && value !== null && value !== "") {
      params[field.paramName] = value;
    }
  }

  return { endpoint, method, params };
}
