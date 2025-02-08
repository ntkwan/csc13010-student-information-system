import { ApiProperty } from '@nestjs/swagger';

export class TokensEntity {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;
}
