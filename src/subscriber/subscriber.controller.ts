import { Body, Controller, Delete, Get, Headers, Param, Post } from '@nestjs/common';
import { SubscriberService } from './subscriber.service';

@Controller('subscriber')
export class SubscriberController {
    constructor(private subscriberService: SubscriberService) {}

    @Post('addSub')
    async checkSubscriber(@Body() payload: any){
        return this.subscriberService.registerAccountWebhook(payload);
    }

    @Get('all-sub')
    async getAllSubscribersFromDB(){
        return this.subscriberService.getAllSubscribersFromDB();
    }

    @Get('get-sub')
    async getSubscriber(){
        return this.subscriberService.getSubscriber();
    }

    @Delete('del-sub/:id')
    async deleteSubscriber(@Param("id") id: any){
        return this.subscriberService.deleteSubscriber(id);
    }

    @Get("query-pack-list")
    async queryPackageList(){
        return this.subscriberService.queryPackageList();
    }
    @Get("query-usage")
    async queryUsage(){
        return this.subscriberService.queryUsage();
    }
    @Delete("delete-pack/:id")
    async deletePackage(@Param("id") id: any){
        return this.subscriberService.deletePackage(id);
    }
    @Get(":id")
    async subscriberWithId(@Param('id') id: string, @Headers('x-customer-email') customerEmail: string,){
        return this.subscriberService.subscriberWithId(id, customerEmail)
    }
}
