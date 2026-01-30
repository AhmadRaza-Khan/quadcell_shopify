import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { join } from 'path';
import XlsxPopulate from 'xlsx-populate';
import { UploadSimDto } from './dto';

@Injectable()
export class SimService {
    constructor(private prisma: PrismaService){}
    async importSimsFromExcel() {
        const filePath = join(process.cwd(), 'public', 'e-sims.xlsx');

        const workbook = await XlsxPopulate.fromFileAsync(filePath, { password: 'Quadcell' });
        const sheet = workbook.sheet(0);

        const rows: any[][] = sheet.usedRange().value();
        const [header, ...dataRows] = rows;

        const clean = (v: any) => v === null || v === undefined || v === '-' || v === '' ? null : v;

        const data = dataRows.map((row) => {
            return {
            imsi: String(clean(row[header.indexOf('IMSI')])),
            iccid: String(clean(row[header.indexOf('ICCID')])),
            msisdn: String(clean(row[header.indexOf('MSISDN')])),
            lpa: String(clean(row[header.indexOf('LPA')])),
            account: String(clean(row[header.indexOf('Account')])),
            type: 'e-sim',
            };
        });

        return this.prisma.esim.createMany({
            data,
            skipDuplicates: true,
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
