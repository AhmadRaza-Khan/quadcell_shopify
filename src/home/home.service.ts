import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class HomeService {
    constructor(){}
    index(res) {
        return res.sendFile(join(process.cwd(), 'public', 'home.html'));
    }
}
