import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtGuard } from '../auth/guard';

@Controller('order')
export class OrderController {
  constructor(private service: OrderService){}
  @Get("orders-all")
  getAllOrders(){
    return this.service.getAllOrders();
  }

  @Get("orders-today")
  getTodayOrders(){
    return this.service.getTodayOrders();
  }

  @Post("order-webhook")
  orderWebhook(@Body()data: any) {
    return this.service.orderWebhook(data);
  }

  @Get("list")
  listWebhooks() {
    return this.service.listWebhooks();
  }
}
