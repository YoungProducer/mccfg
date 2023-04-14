import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @IsNotEmpty({
    message: '"refreshToken" property is missing!',
  })
  @ApiProperty({
    type: String,
  })
  refreshToken: string;
}
