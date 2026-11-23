import { NextResponse } from 'next/server';

const STREAM_KEY =
  process.env.SAWERIA_STREAM_KEY || 'bc96ac6cf7cf8677c20daf3c023ecf4e';

export async function GET() {
  try {
    const res = await fetch(
      `https://backend.saweria.co/template/qr?stream_key=${STREAM_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json.data || {});
    }

    return NextResponse.json({
      username: 'kurumitokisaki',
      text1: 'Kurunime Saweria',
      text2: 'DONASIKAN UNTUK MENDUKUNG KURUNIME',
    });
  } catch (err) {
    return NextResponse.json({
      username: 'kurumitokisaki',
      text1: 'Kurunime Saweria',
      text2: 'DONASIKAN UNTUK MENDUKUNG KURUNIME',
    });
  }
}
