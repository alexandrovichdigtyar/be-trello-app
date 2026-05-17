import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { RequirePermission } from '../auth/require-permission.decorator';

type Board = {
  id: string;
  title: string;
  ownerId: string;
};

const boards: Board[] = [
  { id: 'b1', title: 'Roadmap', ownerId: 'demo-user' },
  { id: 'b2', title: 'Backlog', ownerId: 'demo-user' },
];

@Controller('boards')
export class BoardsController {
  @Get('_whoami')
  whoami(@Req() req: FastifyRequest) {
    return {
      service: 'boards-service',
      identity: req.identity ?? null,
    };
  }

  @Get()
  list() {
    return boards;
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return boards.find((b) => b.id === id) ?? null;
  }

  @Post()
  @RequirePermission('board:create')
  create(@Body() dto: { title: string }, @Req() req: FastifyRequest) {
    const board: Board = {
      id: `b${boards.length + 1}`,
      title: dto.title,
      ownerId: req.identity?.userId ?? 'unknown',
    };
    boards.push(board);
    return board;
  }
}
