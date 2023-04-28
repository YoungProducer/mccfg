import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ModVersionDto } from 'server/domain/mods/dto/mod-version.dto';
import { UserDto } from 'server/domain/users/dto/user.dto';
import { Default } from 'server/utils/class-transformer/decorators/default';

@Exclude()
export class ConfigDto {
  @Expose()
  @ApiProperty({
    type: Number,
  })
  id: number;

  @Expose()
  @ApiProperty({
    type: String,
  })
  version: string;

  @Expose()
  @ApiProperty({
    type: String,
  })
  fileName: string;
}

@Exclude()
export class ConfigPopulatedDto extends ConfigDto {
  @Expose()
  @Type(() => UserDto)
  @Default(null)
  @ApiProperty({
    type: UserDto,
  })
  owner: UserDto;

  @Expose()
  @Type(() => ModVersionDto)
  @Default(null)
  @ApiProperty({
    type: ModVersionDto,
  })
  primaryMod: ModVersionDto;

  @Expose()
  @Type(() => ModVersionDto)
  @Default([])
  @ApiProperty({
    type: ModVersionDto,
    isArray: true,
  })
  dependecies: ModVersionDto[];
}
