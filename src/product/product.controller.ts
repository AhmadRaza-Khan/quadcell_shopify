// import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
// import { ProductService } from './product.service';
// import { UpdateProductDto } from './dto';
// import type { Response } from 'express';
// import { JwtGuard } from '../auth/guard';

// // @UseGuards(JwtGuard)
// @Controller('product')
// export class ProductController {
//     constructor(private service: ProductService){}
//     @Get('save')
//     saveProducts(){
//         return this.service.saveProducts()
//     }
//     @Post("sync")
//     syncProducts(){
//         return this.service.syncProductsToShopify();
//     }
//     @Get("get-synced")
//     getSyncedProducts(@Res() res: Response){
//         return this.service.getSyncedProducts(res);
//     }
//     @Get("get-unsynced")
//     getUnSyncedProducts(@Res() res: Response){
//         return this.service.getUnSyncedProducts(res);
//     }

//     @Post("update")
//     async updateProduct(@Body() dto: UpdateProductDto, @Res() res: Response){
//         await this.service.updateProduct(dto);
//         return res.json({ success: true, status:200, message: 'Product updated successfully' });
//     }
// }
