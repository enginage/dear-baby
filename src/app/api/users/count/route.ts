import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error fetching user count:', error)
      return NextResponse.json({ error: 'Failed to fetch user count' }, { status: 500 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error('Error in user count API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
