// import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
// import type { Request, Response } from 'express';
// import { OrderService } from './order.service';
// import { JwtGuard } from '../auth/guard';

// @UseGuards(JwtGuard)
// @Controller('order')
// export class OrderController {
//   constructor(private service: OrderService){}
//   @Post('create')
//   async handleOrderCreated(@Req() req: Request, @Res() res: Response) {
//     const result = await this.service.handleOrderCreated(req);
//     if (result.ok) {
//       return res.status(200).send('OK');
//     }
//     return res.status(401).send('Unauthorized');
//   }
//   @Get("orders-all")
//   getAllOrders(){
//     return this.service.getAllOrders();
//   }

//   @Get("orders-today")
//   getTodayOrders(){
//     return this.service.getTodayOrders();
//   }

//   @Get("orders-failed")
//   getFailedOrders(@Res() res: Response){
//     return this.service.getFailedOrders(res);
//   }
// }
