import { Controller, Get } from '@nestjs/common';
import { SimService } from './sim.service';

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
}
