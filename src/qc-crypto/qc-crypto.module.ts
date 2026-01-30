import { Module } from '@nestjs/common';
import { QuadcellCryptoService } from './qc-crypto.service';

@Module({
  providers: [QuadcellCryptoService],
  exports: [QuadcellCryptoService],
})
export class QuadcellCryptoModule {}
