import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuadcellCryptoService } from 'src/qc-crypto/qc-crypto.service';

@Injectable()
export class SubscriberService {
    constructor(
    private readonly quadcellCrypto: QuadcellCryptoService,
    private config: ConfigService,
    private prisma: PrismaService
  ) {}


  async registerAccountWebhook(payload: any) {

    await this.prisma.subscriber.create({
      data: {
        customerId: String(payload.id),
      },
    });

    return {message: "Webhook recieved", status: 200, success: true};
    }

  async decryptSubscriberData(): Promise<any> {
    const getFirst = await this.prisma.test.findFirst() || { payload: '' };
    const decryptedResponse = this.quadcellCrypto.decrypt(getFirst.payload);
    return decryptedResponse;
  }
}
