'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { estAdmin } from '@/lib/membres'

export async function changerRoleMembre(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login')
  }

  const { data: adminProfile } = await supabase
    .from('membres')
    .select('role')
    .eq('compte_id', user.id)
    .single()

  if (!adminProfile || !estAdmin(adminProfile.role)) {
    return redirect('/dashboard')
  }

  const membreId = formData.get('membreId') as string
  const nouveauRole = formData.get('nouveauRole') as string

  const { error } = await supabase
    .from('membres')
    .update({ role: nouveauRole })
    .eq('id', membreId)

  if (error) {
    return redirect('/admin/roles?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/roles')
  revalidatePath('/admin/membres')
  redirect('/admin/roles?success=Rôle+mis+à+jour+avec+succès')
}
