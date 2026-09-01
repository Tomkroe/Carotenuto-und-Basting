import { Injectable, NotFoundException } from "@nestjs/common";
import { Workflow } from "@maklerprogram/types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateWorkflowDto } from "./dto/create-workflow.dto";
import { UpdateWorkflowDto } from "./dto/update-workflow.dto";

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mandantId: string): Promise<Workflow[]> {
    const workflows = await this.prisma.workflow.findMany({
      where: { mandantId },
      orderBy: { createdAt: "asc" },
    });
    return workflows.map(toWorkflow);
  }

  async create(mandantId: string, dto: CreateWorkflowDto): Promise<Workflow> {
    const workflow = await this.prisma.workflow.create({
      data: { ...dto, mandantId },
    });
    return toWorkflow(workflow);
  }

  async update(mandantId: string, id: string, dto: UpdateWorkflowDto): Promise<Workflow> {
    const existing = await this.prisma.workflow.findFirst({ where: { id, mandantId } });
    if (!existing) throw new NotFoundException("Workflow nicht gefunden.");
    const workflow = await this.prisma.workflow.update({ where: { id }, data: dto });
    return toWorkflow(workflow);
  }

  async remove(mandantId: string, id: string): Promise<void> {
    const existing = await this.prisma.workflow.findFirst({ where: { id, mandantId } });
    if (!existing) throw new NotFoundException("Workflow nicht gefunden.");
    await this.prisma.workflow.delete({ where: { id } });
  }
}

function toWorkflow(workflow: { id: string; label: string; prompt: string; createdAt: Date }): Workflow {
  return {
    id: workflow.id,
    label: workflow.label,
    prompt: workflow.prompt,
    createdAt: workflow.createdAt.toISOString(),
  };
}
