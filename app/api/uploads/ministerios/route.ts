import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ministerios');

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = path.extname(file.name) || '.png';
  const fileName = `logo-${Date.now()}${extension}`;

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return NextResponse.json({ url: `/uploads/ministerios/${fileName}` });
}