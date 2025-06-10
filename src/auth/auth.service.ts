import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { bcryptAdapter, envs } from 'src/config';
import { ValidRoles } from './enums/valid-roles.enum';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('AuthService')

  constructor(
      private readonly _jwtService: JwtService,
  ) {
      super()
  }

  onModuleInit() {
      this.$connect()
      this._logger.log('Database connected')
  }

  async signJwt( payload: JwtPayload ) {
    return this._jwtService.sign(payload)
  }

  async login( { ni, password }: LoginUserDto ) {
     
    const user = await this.r12Usuario.findFirst({
      where: { R12Ni: ni },
      include: {
        sucursal: {
          select: { R11Nom: true, R11NumSuc: true }
        }
      }
    })

    if ( !user || !user.R12Activ ) {
      console.log(bcryptAdapter.hash('123456'));
      
      throw new RpcException({
        message: `Usuario con clave ${ ni } no existe`,
        status: HttpStatus.NOT_FOUND
      })
    }

    if ( user.R12Rol === ValidRoles.ejecutivo ) {
      throw new RpcException({
        message: 'No cuentas con los permisos necesarios para iniciar sesión',
        status: HttpStatus.UNAUTHORIZED
      })
    }

    if ( ni !== user.R12Ni ) {
      throw new RpcException({
        message: 'Usuario incorrecto',
        status: HttpStatus.BAD_REQUEST
      })
    }

    if ( !bcryptAdapter.compare( password, user.R12Password ) ) {
      throw new RpcException({
        message: 'Credenciales incorrectas',
        status: HttpStatus.BAD_REQUEST
      })
    }

    const { R12Password, ...rest } = user
    
    return {
      user: rest,
      token: await this.signJwt({ R12Id: user.R12Id, R12Suc_id: user.R12Suc_id, R12Coop_id: user.R12Coop_id })
    }

  }

  async checkAuthStatus( token: string ) {

    try {

      const { sub, iat, exp, ...currentUser } = this._jwtService.verify(token, {
          secret: envs.jwtSecret,
      })

      const userID= currentUser.R12Id

      const user = await this.r12Usuario.findFirst({
        where: { R12Id: userID },
        include: {
          sucursal: {
            select: { R11Nom: true, R11NumSuc: true }
          }
        }
      })

      if ( !user ) {
        throw new RpcException({
          message: `Usuario con id ${ userID } no existe`,
          status: HttpStatus.NOT_FOUND
        })
      }  
      
      const { R12Password, ...rest } = user

      return { 
        user: rest,
        token: await this.signJwt({ R12Id: user.R12Id, R12Suc_id: user.R12Suc_id, R12Coop_id: user.R12Coop_id })
      }
      
    } catch (err) {
      throw new RpcException({
        status: 400,
        message: 'Invalid token'
      })
    }
  }

}
