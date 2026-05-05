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
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Only admin can add members
    if (project.createdById !== payload.userId) {
      return NextResponse.json({ error: 'Only project admin can add members' }, { status: 403 });
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return NextResponse.json({ error: 'User with this email not found' }, { status: 404 });

    const existingMember = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: userToAdd.id, projectId: params.id } }
    });

    if (existingMember) return NextResponse.json({ error: 'User is already a member' }, { status: 400 });

    const member = await prisma.projectMember.create({
      data: {
        userId: userToAdd.id,
        projectId: params.id,
        role: 'MEMBER'
      }
    });

    return NextResponse.json({ message: 'Member added successfully', member }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
