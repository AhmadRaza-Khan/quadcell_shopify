import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QuadcellCryptoModule } from 'src/qc-crypto/qc-crypto.module';
import { HandlerModule } from 'src/handler/handler.module';

@Module({
  imports: [
    QuadcellCryptoModule,
    HandlerModule
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
