import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RefreshReponseDto {
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
