import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { transaction_id, status } = body;
  const admin = createAdminClient();

  if (status === 'ACCEPTED' && transaction_id) {
    const { data: paiement } = await admin
      .from('paiements')
      .select('*')
      .eq('reference', transaction_id)
      .single();

    if (paiement) {
      await admin.from('paiements')
        .update({ statut: 'valide', date_validation: new Date().toISOString() })
        .eq('id', paiement.id);

      if (paiement.type === 'droit_inscription') {
        await admin.from('droits_inscription')
          .update({ statut: 'paye', date_paiement: new Date().toISOString() })
          .eq('membre_id', paiement.membre_id);
      }
    }
  }

  return NextResponse.json({ success: true });
}
