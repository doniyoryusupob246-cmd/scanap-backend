import prisma from '@/prisma/prisma-client';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  try {
    const { hash, fileName } = await req.json();
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as { userId: string };

    const scanResponse = await fetch(`${process.env.MOBSF_URL}/api/v1/scan`, {
      method: 'POST',
      headers: {
        Authorization: process.env.MOBSF_API_KEY!,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `hash=${hash}&re_scan=0`,
    });

    const mobsfReport = await scanResponse.json();

    const n8nResponse = await fetch(process.env.N8N_WEBHOOK!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report: mobsfReport }),
    });

    const aiReport = await n8nResponse.json();

    const rawText = aiReport.output;
    const cleanedText = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsedResult = JSON.parse(cleanedText);

    await prisma.scan.create({
      data: {
        userId: decoded.userId,
        fileName,
        hash,
        verdict: parsedResult.verdict,
        score: parsedResult.score,
        report: parsedResult,
      },
    });

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
