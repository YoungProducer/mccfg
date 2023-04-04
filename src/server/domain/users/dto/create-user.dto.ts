import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

@Exclude()
export class CreateUserDto {
  @Expose()
  @IsString()
  @IsNotEmpty({
    message: `'username' property is missing in request body!`,
  })
  @ApiProperty()
  username: string;

  @Expose()
  @IsString()
  @IsEmail()
  @IsNotEmpty({
    message: `'email' property is missing in request body!`,
  })
  @ApiProperty()
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty({
    message: `'password' property is missing in request body!`,
  })
  @ApiProperty()
  password: string;

  @Expose()
  @IsString()
  @IsNotEmpty({
    message: `'salt' property is missing in request body!`,
  })
  @ApiProperty()
  salt: string;
}
