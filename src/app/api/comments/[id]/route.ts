import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get comment to find post_id
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from('comments')
      .select('post_id')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Delete comment
    const { error } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Update comments count
    if (comment?.post_id) {
      await supabaseAdmin.rpc('decrement_comments_count', { post_id: comment.post_id })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}

