import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ActivityLog } from 'src/common/decorators/activity-log.decorator';
import { ActivityLogRpcInterceptor } from 'src/common/interceptor/activity-log-rpc.interceptor';
import { AuditActionEnum } from './enums/audit-action.enum';
import { RpcMetaContext } from './interfaces/rpc-meta-context.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'auth-ms',
    module: 'auth',
    action: AuditActionEnum.LOGIN,
    eventName: 'auth.login',
    operationName: 'LOGIN',
    entities: [], // 👈 operación, no entidad
  })
  @MessagePattern('auth.login_user')
  login(
    @Payload() { loginUserDto }: { loginUserDto: LoginUserDto, meta: RpcMetaContext }
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
