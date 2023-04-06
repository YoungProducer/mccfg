import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class CreateVersionDto {
  @Expose()
  @IsString()
  @ApiProperty()
  version!: string;
}
