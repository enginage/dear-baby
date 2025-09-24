import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user already disliked this post
    const { data: existingDislike } = await supabaseAdmin
      .from('dislikes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user_id)
      .single()

    if (existingDislike) {
      return NextResponse.json(
        { error: 'Post already disliked' },
        { status: 400 }
      )
    }

    // Remove any existing like
    await supabaseAdmin
      .from('likes')
      .delete()
      .eq('post_id', id)
      .eq('user_id', user_id)

    // Add dislike
    const { data, error } = await supabaseAdmin
      .from('dislikes')
      .insert({
        post_id: id,
        user_id,
      })
      .select()
      .single()

    if (error) throw error

    // Update counts
    await supabaseAdmin.rpc('increment_dislikes_count', { post_id: id })
    await supabaseAdmin.rpc('decrement_likes_count', { post_id: id })

    return NextResponse.json({ dislike: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to dislike post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('dislikes')
      .delete()
      .eq('post_id', id)
      .eq('user_id', user_id)

    if (error) throw error

    // Update count
    await supabaseAdmin.rpc('decrement_dislikes_count', { post_id: id })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to undislike post' },
      { status: 500 }
    )
  }
}

