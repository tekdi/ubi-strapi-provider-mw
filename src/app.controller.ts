import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App') // Grouping the APIs under the "App" tag in Swagger
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	@ApiOperation({
		summary: 'Get Hello Message',
		description: 'Returns a hello message from the AppService',
	})
	getHello(): string {
		return this.appService.getHello();
	}
}
