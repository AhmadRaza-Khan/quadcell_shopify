import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { QUADCELL_KEYS } from './qc-crypto.constants';

const BLOCK_SIZE = 8;
const FF = 0xff;

@Injectable()
export class QuadcellCryptoService {
  /* =======================
     PUBLIC METHODS
  ======================== */

  encrypt(payload: object, keyIndex = 0x01): string {
    const key = this.getKey(keyIndex);

    const jsonBuffer = Buffer.from(JSON.stringify(payload), 'utf8');
    const padded = this.padFF(jsonBuffer);

    const encryptedBody = this.encrypt3DES(padded, key);
    const mac = this.generateMAC(encryptedBody, key);

    const totalLength = 1 + encryptedBody.length + mac.length;

    const header = Buffer.from([
      (totalLength >> 8) & 0xff,
      totalLength & 0xff,
      keyIndex,
    ]);

    return Buffer.concat([
      header,
      encryptedBody,
      mac,
    ])
      .toString('hex')
      .toUpperCase();
  }

  decrypt(hexData: string): any {
    const buffer = Buffer.from(hexData, 'hex');

    const keyIndex = buffer[2];
    const key = this.getKey(keyIndex);

    const encryptedBody = buffer.slice(3, buffer.length - 8);
    const receivedMac = buffer.slice(buffer.length - 8);

    const calculatedMac = this.generateMAC(encryptedBody, key);
    if (!calculatedMac.equals(receivedMac)) {
      throw new Error('Quadcell MAC validation failed');
    }

    const decrypted = this.decrypt3DES(encryptedBody, key);
    const unpadded = this.unpadFF(decrypted);

    return JSON.parse(unpadded.toString('utf8'));
  }

  /* =======================
     INTERNAL HELPERS
  ======================== */

  private getKey(index: number): Buffer {
    const key = QUADCELL_KEYS[index];
    if (!key) {
      throw new Error(`Invalid Quadcell key index: ${index}`);
    }
    return key;
  }

  private padFF(buffer: Buffer): Buffer {
    const padLen = BLOCK_SIZE - (buffer.length % BLOCK_SIZE || BLOCK_SIZE);
    return padLen === BLOCK_SIZE
      ? buffer
      : Buffer.concat([buffer, Buffer.alloc(padLen, FF)]);
  }

  private unpadFF(buffer: Buffer): Buffer {
    let end = buffer.length;
    while (end > 0 && buffer[end - 1] === FF) end--;
    return buffer.slice(0, end);
  }

  private encrypt3DES(data: Buffer, key: Buffer): Buffer {
    const cipher = crypto.createCipheriv('des-ede3', key, null);
    cipher.setAutoPadding(false);
    return Buffer.concat([cipher.update(data), cipher.final()]);
  }

  private decrypt3DES(data: Buffer, key: Buffer): Buffer {
    const decipher = crypto.createDecipheriv('des-ede3', key, null);
    decipher.setAutoPadding(false);
    return Buffer.concat([decipher.update(data), decipher.final()]);
  }

  private generateMAC(encryptedBody: Buffer, key: Buffer): Buffer {
    const footer = Buffer.concat([
      encryptedBody.slice(-1),
      Buffer.alloc(7, FF),
    ]);
    return this.encrypt3DES(footer, key);
  }
}
