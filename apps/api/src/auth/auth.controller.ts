import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Account, LoginResult } from '@9ja-vote/shared-types';
import { AuthService } from './auth.service';
import { AuthedRequest, CurrentAccount, JwtAuthGuard } from './auth.guard';
import { CreateAccountDto, DisableMfaDto, LoginDto, MfaCodeDto, PasswordChangeDto, RefreshDto } from './dto';
import { Req } from '@nestjs/common';
import { TokenClaims } from './token';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto): LoginResult {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto): LoginResult {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  logout(@Req() req: AuthedRequest): void {
    if (req.claims) this.auth.logout(req.claims);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@CurrentAccount() account: Account): Account {
    return this.auth.me(account.id);
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  setupMfa(@CurrentAccount() account: Account): { secret: string; otpauthUrl: string } {
    return this.auth.setupMfa(account.id);
  }

  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  enableMfa(@CurrentAccount() account: Account, @Body() dto: MfaCodeDto): Account {
    return this.auth.enableMfa(account.id, dto.code);
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  disableMfa(@CurrentAccount() account: Account, @Body() dto: DisableMfaDto): Account {
    return this.auth.disableMfa(account.id, dto.password);
  }

  @Post('password')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  changePassword(@CurrentAccount() account: Account, @Body() dto: PasswordChangeDto): void {
    this.auth.changePassword(account.id, dto.currentPassword, dto.newPassword);
  }
}

export type { TokenClaims, CreateAccountDto };
