import { Module } from '@nestjs/common';
import { SubscriberService } from './subscriber.service';
import { SubscriberController } from './subscriber.controller';
import { QuadcellCryptoModule } from 'src/qc-crypto/qc-crypto.module';
import { HandlerModule } from 'src/handler/handler.module';

@Module({
  imports: [
    QuadcellCryptoModule,
    HandlerModule
  ],
  providers: [SubscriberService],
  controllers: [SubscriberController]
})
export class SubscriberModule {}
