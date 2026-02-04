import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import { extractFull } from 'node-7z';
import { join } from 'path';
import XlsxPopulate from 'xlsx-populate';
import { UploadSimDto } from './dto';

@Injectable()
export class SimService {
    constructor(private prisma: PrismaService){}
       async importSimsFromUpload({
            excelPath,
            zipPaths,
            password,
        }: {
            excelPath: string;
            zipPaths: string[];
            password: string;
        }) {
            const qrDir = join(process.cwd(), 'public', 'uploads', 'QR');

            if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        for (const zipPath of zipPaths) {
        await this.extractZip(zipPath, qrDir, password);
        }

        const workbook = await XlsxPopulate.fromFileAsync(excelPath, { password });
        const sheet = workbook.sheet(0);
        const rows: any[][] = sheet.usedRange().value();
        const [header, ...dataRows] = rows;

        const clean = (v: any) => (v === null || v === undefined || v === '-' || v === '' ? null : v);

        const data = dataRows.map((row) => ({
        imsi: String(clean(row[header.indexOf('IMSI')])),
        iccid: String(clean(row[header.indexOf('ICCID')])),
        msisdn: String(clean(row[header.indexOf('MSISDN')])),
        lpa: String(clean(row[header.indexOf('LPA')])),
        account: String(clean(row[header.indexOf('Account')])),
        type: 'e-sim',
        }));

        const result = await this.prisma.esim.createMany({
                data,
                skipDuplicates: true,
                });

        return { "message": "Imported succesfully", "status": 201, "success": true };
    }

    private async extractZip(zipPath: string, outputDir: string, password: string) {
        return new Promise<void>((resolve, reject) => {
        const stream = extractFull(zipPath, outputDir, {
            password,
            $bin: require('7zip-bin').path7za,
            overwrite: 'a',
        });

        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
        });
    }


    async uploadNewSim(simDto: UploadSimDto) {
        const { imsi, iccid, msisdn, type, lpa, account } = simDto;
        const resp = await this.prisma.esim.create({
            data: {
                imsi: String(imsi),
                iccid: String(iccid),
                msisdn: String(msisdn),
                type: String(type),
                lpa: String(lpa),
                account: String(account),
            }
        });
        console.log(resp);
        return { message: 'Sim uploaded successfully', success: true, statusCode: 201 };
    }

    async getEsims() {
        return this.prisma.esim.findMany( {where: { type: 'e-sim' }} );
    }

    async getPsims() {
        return this.prisma.esim.findMany( {where: { type: 'p-sim' }} );
    }

}
