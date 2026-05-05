import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  try {
    // Get projects the user is a member of
    const userProjects = await prisma.projectMember.findMany({
      where: { userId: payload.userId },
      select: { projectId: true }
    });
    
    // Also include projects created by the user
    const createdProjects = await prisma.project.findMany({
      where: { createdById: payload.userId },
      select: { id: true }
    });

    const projectIds = [
      ...userProjects.map(p => p.projectId),
      ...createdProjects.map(p => p.id)
    ];

    if (projectIds.length === 0) {
      return NextResponse.json({ tasks: [], stats: { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 } });
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds }
      },
      include: {
        project: { select: { name: true } },
        assignedTo: { select: { name: true } }
      }
    });

    const now = new Date();
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      done: tasks.filter(t => t.status === 'DONE').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length
    };

    return NextResponse.json({ tasks, stats });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
