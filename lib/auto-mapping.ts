import { FieldConfig } from "./controls";

interface ApiParameter {
  name: string;
  type: string;
  format?: string | null;
  enumValues?: string | null;
  pattern?: string | null;
  required: boolean;
}

export function mapParameterToControl(param: ApiParameter): FieldConfig {
  const base = {
    label: param.name,
    required: param.required,
    paramName: param.name,
  };

  if (param.type === "boolean") {
    return {
      ...base,
      control: "ListInput",
      isBool: true,
    };
  }

  if (param.type === "array") {
    return {
      ...base,
      control: "ListInput",
      multipleChoice: true,
    };
  }

  if (param.type === "integer" || param.type === "number") {
    return {
      ...base,
      control: "StringInput",
      numberOnly: param.type === "integer" ? "Natural" : "Decimal",
    };
  }

  if (param.format === "date" || param.format === "date-time") {
    return {
      ...base,
      control: "DateInput",
      dateOnly: true,
    };
  }

  if (param.enumValues) {
    return {
      ...base,
      control: "ListInput",
    };
  }

  if (param.pattern) {
    return {
      ...base,
      control: "StringInput",
      regexp: "custom",
      customPattern: param.pattern,
    };
  }

  return {
    ...base,
    control: "StringInput",
  };
}
