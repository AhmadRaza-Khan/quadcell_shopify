import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ORDER_QUEUE } from './queue.constants';
import { QueueService } from './queue.service';
import { OrderConsumer } from './order.consumer';
import { QuadcellCryptoModule } from 'src/qc-crypto/qc-crypto.module';
import { HandlerModule } from 'src/handler/handler.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: ORDER_QUEUE,
    }),
    QuadcellCryptoModule,
    HandlerModule
  ],
  providers: [QueueService, OrderConsumer],
  exports: [QueueService],
})
export class QueueModule {}
