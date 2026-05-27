import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WorkspaceModule } from './modules/workspace/workspace.module';

@Module({
  imports: [WorkspaceModule],
  controllers: [AppController],
})
export class AppModule {}
