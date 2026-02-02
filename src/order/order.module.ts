import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [
    QueueModule,
  ],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
