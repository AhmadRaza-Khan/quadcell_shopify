// import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
// import { InventoryService } from './inventory.service';
// import type { Response } from 'express';
// import { JwtGuard } from '../auth/guard';

// @UseGuards(JwtGuard)
// @Controller('inventory')
// export class InventoryController {
//     constructor(private service: InventoryService){}

//     @Post("update-db-stock")
//     async updateStock(){
//         return this.service.stockUpdateInDB();
//     }

//     @Post("update-inventory")
//     async updateInventory(@Res() res: Response){
//         return this.service.updateInventory(res);
//     }

//     @Get("stock-all")
//     getAllOrders(@Res() res: Response){
//         return this.service.getAllStock(res);
//     }
    
//     @Get("stock-going")
//     getTodayOrders(@Res() res: Response){
//         return this.service.getStockGoing(res);
//     }
    
//     @Get("stock-out")
//     getFailedOrders(@Res() res: Response){
//         return this.service.getStockOut(res);
//     }
// }
