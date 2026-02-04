import { Module } from '@nestjs/common';
import { SubscriberService } from './subscriber.service';
import { SubscriberController } from './subscriber.controller';
import { HandlerModule } from 'src/handler/handler.module';

@Module({
  imports: [
    HandlerModule
  ],
  providers: [SubscriberService],
  controllers: [SubscriberController]
})
export class SubscriberModule {}
