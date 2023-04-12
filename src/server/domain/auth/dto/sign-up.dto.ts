import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@Exclude()
export class SignUpDto {
  @Expose()
  @IsString()
  @IsNotEmpty({
    message: `'username' property is missing in request body!`,
  })
  @ApiProperty({
    type: String,
  })
  username: string;

  @Expose()
  @IsEmail()
  @IsNotEmpty({
    message: `'email' property is missing in request body!`,
  })
  @ApiProperty({
    type: String,
  })
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty({
    message: `'password' property is missing in request body!`,
  })
  @ApiProperty({
    type: String,
  })
  password: string;
}
