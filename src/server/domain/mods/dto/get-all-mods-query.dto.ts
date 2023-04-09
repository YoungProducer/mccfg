import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GetAllModsQueryDto {
  @Expose()
  @ApiProperty({
    type: Boolean,
    required: false,
    name: 'versions',
    description: 'Whether populate mod versions or not',
  })
  versions?: string;
}
