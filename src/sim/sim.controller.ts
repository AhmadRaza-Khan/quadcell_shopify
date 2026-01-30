import { Body, Controller, Get, Post } from '@nestjs/common';
import { SimService } from './sim.service';
import { UploadSimDto } from './dto';

@Controller('sim')
export class SimController {
    constructor(private service: SimService){}
    @Get('import-sims')
    async importSims() {
        return this.service.importSimsFromExcel();
    }
    @Get('e-sims')
    async getAllEsims() {
        return this.service.getEsims();
    }
    @Get('p-sims')
    async getAllPsims() {
        return this.service.getPsims();
    }

    @Post('upload')
    async uploadSim(@Body() simDto: UploadSimDto) {
        return this.service.uploadNewSim(simDto);
    }
}
