import { Exclude, Expose, Type } from 'class-transformer';
import { Default } from 'server/utils/class-transformer/decorators/default';

@Exclude()
export class GetConfigQueryDto {
  @Expose()
  @Type(() => Boolean)
  @Default(false)
  owner: boolean;

  @Expose()
  @Type(() => Boolean)
  @Default(false)
  primaryMod: boolean;

  @Expose()
  @Type(() => Boolean)
  @Default(false)
  dependencies: boolean;
}
