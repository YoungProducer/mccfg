import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class UserDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @IsString()
  @ApiProperty()
  username: string;

  @Expose()
  @IsString()
  @ApiProperty()
  email: string;
}
