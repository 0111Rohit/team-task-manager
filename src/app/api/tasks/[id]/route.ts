import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  try {
    const { status } = await request.json();
    if (!status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { project: true }
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // Check permissions
    // Admin of the project can update any task
    // Assignee can update their own task
    const isProjectAdmin = task.project.createdById === payload.userId;
    const isAssignee = task.assignedToId === payload.userId;

    if (!isProjectAdmin && !isAssignee) {
      return NextResponse.json({ error: 'Forbidden: You can only update tasks assigned to you or if you are the project admin' }, { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
