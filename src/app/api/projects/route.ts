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
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { createdById: payload.userId },
          { members: { some: { userId: payload.userId } } }
        ]
      },
      include: {
        _count: {
          select: { tasks: true, members: true }
        }
      }
    });

    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  try {
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: payload.userId,
        members: {
          create: {
            userId: payload.userId,
            role: 'ADMIN'
          }
        }
      }
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
