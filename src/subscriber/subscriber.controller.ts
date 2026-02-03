import { Body, Controller, Get, Post } from '@nestjs/common';
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

    @Get('del-sub')
    async deleteSubscriber(){
        return this.subscriberService.deleteSubscriber();
    }

    @Get("query-pack-list")
    async queryPackageList(){
        return this.subscriberService.queryPackageList();
    }
    @Get("query-usage")
    async queryUsage(){
        return this.subscriberService.queryUsage();
    }
    @Get("delete-pack")
    async deletePackage(){
        return this.subscriberService.deletePackage();
    }
}
