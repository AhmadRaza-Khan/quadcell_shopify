import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuadcellCryptoService } from 'src/qc-crypto/qc-crypto.service';

@Injectable()
export class HandlerService {
    private readonly apiUrl: string;
    constructor(
        private readonly quadcellCrypto: QuadcellCryptoService,
        private config: ConfigService,
        private prisma: PrismaService,
      ) {this.apiUrl = this.config.get<string>("API_URL")!;}

    async quadcellApiHandler(payload: any, endpoint: any): Promise<any> {

        const encrypted = this.quadcellCrypto.encrypt(payload);

        // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const response = await fetch(`${this.apiUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: encrypted,
        });

        if (!response.ok) {
        return new Error(`API error ${response.status}`);
        }

        const encryptedResponseHex = await response.text();

        const decryptedResponse = this.quadcellCrypto.decrypt(
        encryptedResponseHex,
        );

        return decryptedResponse;
    }
}
