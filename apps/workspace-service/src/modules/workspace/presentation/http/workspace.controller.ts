import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Post } from '@nestjs/common';
import { WorkspacesService } from '../../application/services/workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspaceResponseDto } from './dto/workspace.response.dto';

@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWorkspace(@Body() dto: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
    return this.workspacesService.createWorkspace(dto);
  }

  @Get(':id')
  async findWorkspaceById(@Param('id') id: string): Promise<WorkspaceResponseDto> {
    const workspace = await this.workspacesService.findWorkspaceById(id);
    if (!workspace) throw new NotFoundException(`Workspace ${id} not found`);
    return workspace;
  }
}
