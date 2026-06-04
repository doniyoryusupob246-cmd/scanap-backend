import { error } from 'console';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Token geçersiz' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/upload/:path*', '/api/scan/:path*', '/api/report/:path*'],
};
