import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class CreateModVersionDto {
  @Expose()
  @IsString()
  @ApiProperty()
  version: string;

  @Expose()
  @IsString({ each: true })
  @ApiProperty()
  compatibleMCVersions: string | string[];
}
