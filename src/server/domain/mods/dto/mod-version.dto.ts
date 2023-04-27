import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { VersionResponseDto } from 'server/domain/mcversion/dto/version.response.dto';

@Exclude()
export class ModVersionPopulatedDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  version: string;

  @Expose()
  @Type(() => VersionResponseDto)
  @ApiProperty({
    type: VersionResponseDto,
    isArray: true,
    required: false,
  })
  compatibleMCVersions: VersionResponseDto[];
}

@Exclude()
export class ModVersionDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  version: string;
}
