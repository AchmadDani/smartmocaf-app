import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    await deleteSession();
    return NextResponse.redirect(new URL('/auth/login', request.url));
}
