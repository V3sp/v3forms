export type ControlType = "StringInput" | "DateInput" | "TextInput" | "ListInput";

export interface BaseFieldConfig {
  control: ControlType;
  label: string;
  required: boolean;
  paramName: string;
}

export interface StringInputConfig extends BaseFieldConfig {
  control: "StringInput";
  stringOnly?: boolean;
  numberOnly?: "Natural" | "Decimal" | "Float" | null;
  regexp?: "email" | "IBAN" | "NRB" | "PESEL" | "custom";
  customPattern?: string;
}

export interface DateInputConfig extends BaseFieldConfig {
  control: "DateInput";
  dateOnly?: boolean;
  noPastDate?: boolean;
}

export interface TextInputConfig extends BaseFieldConfig {
  control: "TextInput";
  maxTextSize?: number;
}

export interface ListInputConfig extends BaseFieldConfig {
  control: "ListInput";
  isBool?: boolean;
  multipleChoice?: boolean;
}

export type FieldConfig =
  | StringInputConfig
  | DateInputConfig
  | TextInputConfig
  | ListInputConfig;
