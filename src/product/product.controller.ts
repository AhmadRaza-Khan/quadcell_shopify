import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { UpdateProductDto } from './dto';
import type { Response } from 'express';
import { JwtGuard } from '../auth/guard';

// @UseGuards(JwtGuard)
@Controller('product')
export class ProductController {
    constructor(private service: ProductService){}
    @Get('import-excel')
    async importFromExcel() {
    return await this.service.importFromExcel();
    }

    @Get('imsi-45400')
    async getImsi45400(@Res() res: Response){
      return this.service.getImsi45400(res);
    }

    @Get('imsi-45407')
    async getImsi45407(@Res() res: Response){
      return this.service.getImsi45407(res);
    }

    @Get('sync')
    async syncProductsByCoverage() {
      return this.service.syncProductsToShopify();
    }
    @Get('test')
    async test(@Res() res: Response){
      return this.service.test(res);
    }

    @Get('reset-synced')
    async resetSyncedProductsToPending() {
      return this.service.resetSyncedProductsToPending();
    }
}
