import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { BoardsController } from './boards/boards.controller';
import { JwtVerifier } from './auth/jwt.verifier';
import { PermissionGuard } from './auth/permission.guard';

@Module({
  controllers: [BoardsController],
  providers: [
    JwtVerifier,
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
