import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  try {
    const { title, description, dueDate, priority, assignedToId } = await request.json();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { members: true }
    });

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Ensure user is member
    const isMember = project.members.some(m => m.userId === payload.userId) || project.createdById === payload.userId;
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        status: 'TODO',
        projectId: params.id,
        assignedToId: assignedToId || null
      }
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
