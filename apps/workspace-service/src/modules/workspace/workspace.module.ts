import { Module } from '@nestjs/common';
import { WorkspaceController } from './presentation/http/workspace.controller';
import { WorkspacesService } from './application/services/workspaces.service';
import { WORKSPACE_REPOSITORY } from './domain/repositories/workspace.repository.interface';
import { WorkspacePrismaRepository } from './infrastructure/repositories/workspace.prisma.repository';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [WorkspaceController],
  providers: [
    PrismaService,
    WorkspacesService,
    {
      provide: WORKSPACE_REPOSITORY,
      useClass: WorkspacePrismaRepository,
    },
  ],
})
export class WorkspaceModule {}
