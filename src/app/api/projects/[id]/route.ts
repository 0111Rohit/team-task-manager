import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        tasks: {
          include: { assignedTo: { select: { id: true, name: true } } }
        }
      }
    });

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Ensure user is member
    const isMember = project.members.some(m => m.userId === payload.userId) || project.createdById === payload.userId;
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
