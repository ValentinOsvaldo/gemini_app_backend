import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from './entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const user = this.usersRepository.create(signUpDto);

      const saltOrRounds = 10;
      user.password = bcrypt.hashSync(user.password, saltOrRounds);

      await this.usersRepository.save(user);

      delete user.password;

      return user;
    } catch (error) {
      console.error(error);

      throw new BadRequestException(error.detail || `Couldn't create the user`);
    }
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
      select: {
        email: true,
        password: true,
        id: true,
        name: true,
      },
    });

    if (!user) throw new NotFoundException(`User not found`);

    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException(`email/password not correct`);
    }

    const token = this.getJwt({ id: user.id });

    delete user.password;

    return {
      user,
      token,
    };
  }

  refreshToken(user: User) {
    const token = this.getJwt({ id: user.id });

    return { user, token };
  }

  private getJwt(user: JwtPayload) {
    const payload = { email: user.id };
    return this.jwtService.sign(payload);
  }
}
