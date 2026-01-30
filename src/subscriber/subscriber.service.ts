import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuadcellCryptoService } from 'src/qc-crypto/qc-crypto.service';

@Injectable()
export class SubscriberService {
    constructor(
    private readonly quadcellCrypto: QuadcellCryptoService,
    private config: ConfigService,
  ) {}


  async addSubscriber(): Promise<string> {

    const payload =  {
        "authKey": this.config.get<string>('API_AUTH_KEY'),
        "imsi":"454070012345678",
        "iccid":"89852454070123456789",
        "msisdn":"85291234567",
        "planCode":"123456",
        "validity":"30",
        "lastActiveTime":"204706",
        "initBalance":"100"
    };

    const encrypted = this.quadcellCrypto.encrypt(payload, 0x01);

    const response = await fetch(`${this.config.get<string>('BASE_API_URL')}/addsub`, {
        method: 'POST',
        headers: {
      'Content-Type': 'text/plain',
        },
        body: encrypted,
    })

    const encryptedResponseHex = await response.text();

    const decryptedResponse =
    this.quadcellCrypto.decrypt(encryptedResponseHex);

    console.log(decryptedResponse);

        return decryptedResponse;
    }
    

  async decryptSubscriberData(): Promise<any> {
    const encryptedData = '007905149EE909428CEDB2CE56FA8F090D55B39D32A319BE42A48E4D0DAE9E36DC03D45E9FD2C7CEC3261F5E26738A650A70183790580485E0404A0E47DF79FA4FD294D0326435AC1428F62D93B214B6E130E5871311F1E721D13DC8E85C0AAE6AFAFE3D83F9D207DD82239B90EF159355FFB44274B98FAF7ADBA8'
    const decrypted = this.quadcellCrypto.decrypt(encryptedData);
    return decrypted;
  }
}
