// import { Controller, Get, Res, UseGuards } from '@nestjs/common';
// import { HomeService } from './home.service';
// import { JwtGuard } from '../auth/guard';
// import type { Response } from 'express';

// @UseGuards(JwtGuard)
// @Controller("/")
// export class HomeController {
//     constructor(private service: HomeService){}
//     @Get("/")
//     home(@Res() res: Response){
//         return this.service.index(res)
//     }
// }
