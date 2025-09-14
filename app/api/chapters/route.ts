import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getChaptersByProductId, createChapter, updateChapter } from '@/lib/db/queries/chapter';
import { z } from 'zod';

const createChapterSchema = z.object({
    stripeProductId: z.string(),
    numero: z.number(),
    title: z.string().min(1),
    content: z.string(),
    published: z.boolean().default(false),
});

const updateChapterSchema = z.object({
    id: z.number(),
    title: z.string().min(1).optional(),
    content: z.string().optional(),
    published: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const stripeProductId = searchParams.get('stripeProductId');

        if (!stripeProductId) {
            return NextResponse.json({ error: 'Missing stripeProductId' }, { status: 400 });
        }

        const chapters = await getChaptersByProductId(stripeProductId);
        return NextResponse.json(chapters);
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createChapterSchema.parse(body);

        const chapter = await createChapter({
            ...validatedData,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json(chapter);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
        }
        console.error('Error creating chapter:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = updateChapterSchema.parse(body);
        const { id, ...updateData } = validatedData;

        const chapter = await updateChapter(id, {
            ...updateData,
            updatedAt: new Date(),
        });

        return NextResponse.json(chapter);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
        }
        console.error('Error updating chapter:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}