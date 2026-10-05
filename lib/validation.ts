import { z } from "zod";
import { FieldConfig } from "./controls";

const REGEXPS: Record<string, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  IBAN: /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/,
  NRB: /^\d{2}\d{4}\d{4}\d{4}\d{4}\d{4}\d{4}$/,
  PESEL: /^\d{11}$/,
};

function buildFieldSchema(field: FieldConfig): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.control) {
    case "StringInput": {
      if (field.numberOnly) {
        schema = z.coerce.number();
        if (field.numberOnly === "Natural") {
          schema = (schema as z.ZodNumber).int().positive();
        } else if (field.numberOnly === "Decimal" || field.numberOnly === "Float") {
          schema = (schema as z.ZodNumber).positive();
        }
      } else {
        schema = z.string();
        if (field.regexp === "custom" && field.customPattern) {
          schema = (schema as z.ZodString).regex(
            new RegExp(field.customPattern)
          );
        } else if (field.regexp && REGEXPS[field.regexp]) {
          schema = (schema as z.ZodString).regex(REGEXPS[field.regexp]);
        }
      }
      break;
    }
    case "DateInput": {
      schema = z.string().refine((val) => {
        if (!val) return true;
        const date = new Date(val);
        if (isNaN(date.getTime())) return false;
        if (field.noPastDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        }
        return true;
      }, "Nieprawidłowa data");
      break;
    }
    case "TextInput": {
      schema = z.string();
      if (field.maxTextSize) {
        schema = (schema as z.ZodString).max(field.maxTextSize);
      }
      break;
    }
    case "ListInput": {
      if (field.multipleChoice) {
        schema = z.array(z.string());
      } else {
        schema = z.string();
      }
      break;
    }
    default:
      schema = z.string();
  }

  if (field.required) {
    if (schema instanceof z.ZodString) {
      schema = schema.min(1, "Pole wymagane");
    } else if (schema instanceof z.ZodArray) {
      schema = schema.min(1, "Pole wymagane");
    }
  } else {
    schema = schema.optional();
  }

  return schema;
}

export function buildZodSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    shape[field.paramName] = buildFieldSchema(field);
  }
  return z.object(shape);
}
