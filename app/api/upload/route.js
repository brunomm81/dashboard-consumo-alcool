import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE, expectedCookieValue } from '@/lib/auth';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function POST(request) {
  // Defesa em profundidade: mesmo com o middleware, revalidamos o cookie.
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token || token !== expectedCookieValue()) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  const { fileName, rows } = body || {};
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum dado válido para salvar.' },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseServer();

    // 1) Registra o evento de upload
    const { data: upload, error: uploadErr } = await supabase
      .from('uploads')
      .insert({ file_name: fileName || 'drinks.csv', row_count: rows.length })
      .select()
      .single();

    if (uploadErr) throw uploadErr;

    // 2) Insere as linhas de consumo
    const drinks = rows.map((d) => ({
      upload_id: upload.id,
      country: String(d.country || ''),
      beer_servings: Math.round(Number(d.beer) || 0),
      spirit_servings: Math.round(Number(d.spirit) || 0),
      wine_servings: Math.round(Number(d.wine) || 0),
      total_litres_of_pure_alcohol: Number(d.total) || 0
    }));

    const { error: drinksErr } = await supabase.from('drinks').insert(drinks);
    if (drinksErr) throw drinksErr;

    return NextResponse.json({ ok: true, uploadId: upload.id, count: drinks.length });
  } catch (err) {
    console.error('Erro ao salvar no Supabase:', err);
    return NextResponse.json(
      { error: 'Erro ao salvar no Supabase: ' + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
