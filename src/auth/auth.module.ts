import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
      signOptions: { expiresIn: '2h' },
    }),
    NatsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
