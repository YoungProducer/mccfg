export type ParseBoolPipeOptionalTrue = {
  optional: true;
  defaultValue: boolean;
};

export type ParseBoolPipeOptionalFalse = {
  optional: false;
  defaultValue?: boolean;
};

export type ParseBoolPipeConstructorParams =
  | ParseBoolPipeOptionalTrue
  | ParseBoolPipeOptionalFalse;
