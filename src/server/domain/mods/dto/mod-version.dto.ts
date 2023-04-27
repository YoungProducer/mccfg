import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { VersionResponseDto } from 'server/domain/mcversion/dto/version.response.dto';

@Exclude()
export class ModVersionDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  version: string;
}

@Exclude()
export class ModVersionPopulatedDto extends ModVersionDto {
  @Expose()
  @Type(() => VersionResponseDto)
  @ApiProperty({
    type: VersionResponseDto,
    isArray: true,
    required: false,
  })
  compatibleMCVersions: VersionResponseDto[];
}
