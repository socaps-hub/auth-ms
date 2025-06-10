import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('login')
  @MessagePattern('auth.login_user')
  login(
    @Payload() loginUserDto: LoginUserDto
  ) {
    return this.authService.login(loginUserDto);
  }

  @MessagePattern('auth.check_auth_status')
  checkAuthStatus(
    @Payload() token: string,
  ) {
    return this.authService.checkAuthStatus( token )
  }


}
