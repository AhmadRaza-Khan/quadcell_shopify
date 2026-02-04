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

    @Delete('del-sub')
    async deleteSubscriber(@Body() imsi: any){
        return this.subscriberService.deleteSubscriber(imsi);
    }

    @Get("query-pack-list")
    async queryPackageList(){
        return this.subscriberService.queryPackageList();
    }
    @Get("query-usage")
    async queryUsage(){
        return this.subscriberService.queryUsage();
    }
    @Delete("delete-pack")
    async deletePackage(@Body() payload: any){
        return this.subscriberService.deletePackage(payload);
    }
    @Get(":id")
    async subscriberWithId(@Param('id') id: string, @Headers('x-customer-email') customerEmail: string,){
        return this.subscriberService.subscriberWithId(id, customerEmail)
    }
}
