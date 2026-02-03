import { Module } from '@nestjs/common';
import { HandlerService } from './handler.service';
import { QuadcellCryptoModule } from 'src/qc-crypto/qc-crypto.module';

@Module({
  imports: [QuadcellCryptoModule],
  providers: [HandlerService],
  exports: [HandlerService]
})
export class HandlerModule {}
