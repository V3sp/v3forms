export interface ParsedSpec {
  version: "2.0" | "3.x";
  endpoints: ParsedEndpoint[];
}

export interface ParsedEndpoint {
  method: string;
  path: string;
  params: ParsedParameter[];
}

export interface ParsedParameter {
  name: string;
  location: "query" | "path" | "header" | "body";
  type: string;
  required: boolean;
  format?: string;
  enumValues?: string[];
  description?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
}

function detectVersion(spec: any): "2.0" | "3.x" {
  if (spec.openapi && spec.openapi.startsWith("3.")) return "3.x";
  if (spec.swagger === "2.0") return "2.0";
  if (spec.swagger) return "2.0";
  return "3.x";
}

function resolveRef(spec: any, ref: string): any {
  const parts = ref.replace("#/", "").split("/");
  let current = spec;
  for (const part of parts) {
    current = current?.[part];
  }
  return current;
}

function parseSchema(schema: any, spec: any): Partial<ParsedParameter> {
  if (schema.$schema) {
    schema = resolveRef(spec, schema.$schema);
  }

  const result: Partial<ParsedParameter> = {
    type: schema.type || "string",
    format: schema.format,
    description: schema.description,
    pattern: schema.pattern,
    minLength: schema.minLength,
    maxLength: schema.maxLength,
    minimum: schema.minimum,
    maximum: schema.maximum,
    exclusiveMinimum: schema.exclusiveMinimum,
    exclusiveMaximum: schema.exclusiveMaximum,
  };

  if (schema.enum) {
    result.enumValues = schema.enum.map(String);
  }

  return result;
}

function parseV3Body(bodySchema: any, spec: any): ParsedParameter[] {
  const params: ParsedParameter[] = [];
  const properties = bodySchema.properties || {};
  const required = bodySchema.required || [];

  for (const [name, propSchema] of Object.entries(properties)) {
    const schema = propSchema as any;
    const parsed = parseSchema(schema, spec);
    params.push({
      name,
      location: "body",
      type: parsed.type || "string",
      required: required.includes(name),
      format: parsed.format,
      enumValues: parsed.enumValues,
      description: parsed.description,
      pattern: parsed.pattern,
      minLength: parsed.minLength,
      maxLength: parsed.maxLength,
      minimum: parsed.minimum,
      maximum: parsed.maximum,
      exclusiveMinimum: parsed.exclusiveMinimum,
      exclusiveMaximum: parsed.exclusiveMaximum,
    });
  }

  return params;
}

function parseV2Body(bodySchema: any, spec: any): ParsedParameter[] {
  const params: ParsedParameter[] = [];
  const properties = bodySchema.properties || {};
  const required = bodySchema.required || [];

  for (const [name, propSchema] of Object.entries(properties)) {
    const schema = propSchema as any;
    const parsed = parseSchema(schema, spec);
    params.push({
      name,
      location: "body",
      type: parsed.type || "string",
      required: required.includes(name),
      format: parsed.format,
      enumValues: parsed.enumValues,
      description: parsed.description,
      pattern: parsed.pattern,
      minLength: parsed.minLength,
      maxLength: parsed.maxLength,
      minimum: parsed.minimum,
      maximum: parsed.maximum,
      exclusiveMinimum: parsed.exclusiveMinimum,
      exclusiveMaximum: parsed.exclusiveMaximum,
    });
  }

  return params;
}

export function parseOpenAPI(spec: any): ParsedSpec {
  const version = detectVersion(spec);
  const endpoints: ParsedEndpoint[] = [];
  const paths = spec.paths || {};

  for (const [path, pathItem] of Object.entries(paths)) {
    const methods = ["get", "post", "put", "delete", "patch", "options", "head"];

    for (const method of methods) {
      const operation = (pathItem as any)?.[method];
      if (!operation) continue;

      const params: ParsedParameter[] = [];

      if (version === "3.x") {
        const parameters = operation.parameters || [];
        for (const param of parameters) {
          if (param.$ref) {
            // resolve ref
            continue;
          }
          const schema = param.schema || {};
          const parsed = parseSchema(schema, spec);
          params.push({
            name: param.name,
            location: param.in,
            type: parsed.type || "string",
            required: param.required || false,
            format: parsed.format,
            enumValues: parsed.enumValues,
            description: parsed.description,
            pattern: parsed.pattern,
            minLength: parsed.minLength,
            maxLength: parsed.maxLength,
            minimum: parsed.minimum,
            maximum: parsed.maximum,
            exclusiveMinimum: parsed.exclusiveMinimum,
            exclusiveMaximum: parsed.exclusiveMaximum,
          });
        }

        const requestBody = operation.requestBody;
        if (requestBody) {
          const content = requestBody.content || {};
          for (const mediaType of Object.values(content)) {
            const schema = (mediaType as any).schema;
            if (schema) {
              params.push(...parseV3Body(schema, spec));
            }
          }
        }
      } else {
        const parameters = operation.parameters || [];
        for (const param of parameters) {
          if (param.in === "body") {
            const schema = param.schema || {};
            params.push(...parseV2Body(schema, spec));
          } else {
            const parsed = parseSchema(param, spec);
            params.push({
              name: param.name,
              location: param.in,
              type: parsed.type || "string",
              required: param.required || false,
              format: parsed.format,
              enumValues: parsed.enumValues,
              description: parsed.description,
              pattern: parsed.pattern,
              minLength: parsed.minLength,
              maxLength: parsed.maxLength,
              minimum: parsed.minimum,
              maximum: parsed.maximum,
              exclusiveMinimum: parsed.exclusiveMinimum,
              exclusiveMaximum: parsed.exclusiveMaximum,
            });
          }
        }
      }

      endpoints.push({
        method: method.toUpperCase(),
        path,
        params,
      });
    }
  }

  return { version, endpoints };
}
