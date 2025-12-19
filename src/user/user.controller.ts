import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorators';
import type { User } from '@prisma/client';
import { UserService } from './user.service';
import { join } from 'path';
import type { Response } from 'express';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
    constructor(private userService: UserService){}
    @Get('me')
    getMe(@GetUser() user: User) {
        if (!user) {
            return null;
        }
    return user;
    }
}
