import { Controller, Get } from '@nestjs/common';

@Controller('boards')
export class BoardsController {
  @Get('demo')
  demo() {
    return { message: 'Boards demo (no JWT check on this service)' };
  }
}
