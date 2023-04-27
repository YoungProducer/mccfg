import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ModVersionPopulatedDto } from './mod-version.dto';

@Expose()
export class ModDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @Type(() => ModVersionPopulatedDto)
  @ApiProperty({
    type: ModVersionPopulatedDto,
    isArray: true,
  })
  versions: ModVersionPopulatedDto[];
}
