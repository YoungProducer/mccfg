import { Transform } from 'class-transformer';
import _cloneDeep from 'lodash/cloneDeep';

export function Default(defaultValue: unknown): PropertyDecorator {
  return Transform(({ value }) => value ?? _cloneDeep(defaultValue));
}
