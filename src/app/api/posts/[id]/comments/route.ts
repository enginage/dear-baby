import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users(name)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ comments: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { content, author_id } = await request.json()

    if (!content || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        content,
        post_id: id,
        author_id,
      })
      .select(`
        *,
        author:users(name)
      `)
      .single()

    if (error) throw error

    // Update comments count
    await supabaseAdmin.rpc('increment_comments_count', { post_id: id })

    return NextResponse.json({ comment: data })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: `Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

