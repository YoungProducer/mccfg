import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateConfigDto {
  @IsString()
  @IsNotEmpty({
    message: `"version" field is missing`,
  })
  @ApiProperty({
    type: String,
  })
  version: string;

  @IsInt()
  @IsNotEmpty({
    message: `"primaryModId" field is missing`,
  })
  @ApiProperty({
    type: Number,
  })
  @Type(() => Number)
  primaryModId: number;

  @IsInt({
    each: true,
  })
  @IsNotEmpty({
    message: `"dependenciesIds" field is missing`,
    each: true,
  })
  @ApiProperty({
    type: Number,
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : JSON.parse(value)))
  dependenciesIds: number[];
}
