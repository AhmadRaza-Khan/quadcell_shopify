import { Body, Controller, Get, Post } from '@nestjs/common';
import { SubscriberService } from './subscriber.service';

@Controller('subscriber')
export class SubscriberController {
    constructor(private subscriberService: SubscriberService) {}

    @Post('addSub')
    async checkSubscriber(@Body() dto: any){
        return this.subscriberService.registerWebhook(dto);
    }

    @Get('getWebhooks')
    async getWebhooks(){
        return this.subscriberService.getdata();
    }
}
