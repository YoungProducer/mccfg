import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty({
    message: 'Password is missed in request body!',
  })
  @ApiProperty({
    type: String,
  })
  username: string;

  @IsString()
  @IsNotEmpty({
    message: 'Password is missed in request body!',
  })
  @ApiProperty({
    type: String,
  })
  password: string;
}
