import { Module } from '@nestjs/common';
import { SubscriberService } from './subscriber.service';
import { SubscriberController } from './subscriber.controller';
import { QuadcellCryptoModule } from 'src/qc-crypto/qc-crypto.module';

@Module({
  imports: [QuadcellCryptoModule],
  providers: [SubscriberService],
  controllers: [SubscriberController]
})
export class SubscriberModule {}
