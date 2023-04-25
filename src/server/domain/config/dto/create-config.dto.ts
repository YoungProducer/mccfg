import { ApiProperty } from '@nestjs/swagger';
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
    message: `"ownerId" field is missing`,
  })
  @ApiProperty({
    type: Number,
  })
  ownerId: number;

  @IsInt()
  @IsNotEmpty({
    message: `"primaryModId" field is missing`,
  })
  @ApiProperty({
    type: Number,
  })
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
  dependenciesIds: number[];
}
