import { Module } from '@nestjs/common';
import { SimController } from './sim.controller';
import { SimService } from './sim.service';

@Module({
  controllers: [SimController],
  providers: [SimService]
})
export class SimModule {}
