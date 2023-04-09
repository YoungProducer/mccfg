import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GetModQueryDto {
  @Expose()
  @ApiProperty({
    type: Boolean,
    name: 'versions',
    required: false,
    description: 'Whether populate mod versions or not',
  })
  versions?: string;
}
