import { ForbiddenException, Injectable } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private config: ConfigService, private jwt: JwtService) {}
    async signUp(dto: SignUpDto){
        try {
            const hash = await argon.hash(dto.password);
            dto.password = hash;
            const newUser = await this.prisma.user.create({
                data: {
                    username: dto.username,
                    password: dto.password,
                },
            });
            return this.signToken(newUser.id, newUser.username);
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2002'){
                    throw new ForbiddenException("Username already exists");
                }
            }
            throw error;
        }
    }

    loginForm(res) {
            return res.sendFile(join(process.cwd(), 'public', 'login.html'));
        }

    async signIn(dto: SignInDto){
        const user = await this.prisma.user.findUnique({
            where: {username: dto.username}
        });
        if (!user) throw new ForbiddenException("Credentials incorrect");
        const pwMatches = await argon.verify(user.password, dto.password);
        if (!pwMatches) throw new ForbiddenException("Credentials incorrect");
        return this.signToken(user.id, user.username);
    }
    async signToken(userId: number, username: string): Promise<{access_token: string}>{
        const payload = {
            sub: userId,
            username
        }
        const secret = this.config.get("JWT_SECRET");
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '60m',
            secret
        })
        return { access_token: token }
    }

    async logout(res) {

        res.clearCookie('jwt', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        });
    }

}
