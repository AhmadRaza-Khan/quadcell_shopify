import { BadRequestException, Body, Controller, Get, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { SimService } from './sim.service';
import { UploadSimDto } from './dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('sim')
export class SimController {
    constructor(private service: SimService){}
    
    @Post('import-sims')
    @UseInterceptors(
    FileFieldsInterceptor(
        [
        { name: 'excel', maxCount: 1 },
        { name: 'zip', maxCount: 10 },
        ],
        {
        storage: diskStorage({
            destination: './uploads',
            filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
        }),
        },
    ),
    )
    async importSims(
    @UploadedFiles()
    files: { excel?: Express.Multer.File[]; zip?: Express.Multer.File[] },
    @Body('password') password: string,
    ) {
    if (!files?.excel?.length || !files?.zip?.length) {
        throw new BadRequestException('Excel and ZIP files are required');
    }

    return this.service.importSimsFromUpload({
        excelPath: files.excel[0].path,
        zipPaths: files.zip.map((z) => z.path),
        password,
    });
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
