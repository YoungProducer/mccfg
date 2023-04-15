import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserDto } from 'server/domain/users/dto/user.dto';

@Exclude()
export class SignInResponseDto {
  @Expose()
  @Type(() => UserDto)
  @ApiProperty({
    type: UserDto,
  })
  user: UserDto;

  @Expose()
  @ApiProperty({
    type: String,
  })
  accessToken: string;

  @Expose()
  @ApiProperty({
    type: String,
  })
  refreshToken: string;
}
