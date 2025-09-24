import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getKSTDate } from '@/utils/timezone'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const userId = searchParams.get('user_id') || ''
    const offset = (page - 1) * limit

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users(name),
        comments:comments(count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    const { data: posts, error } = await query

    if (error) throw error

    // If user is logged in, check their like/dislike status for each post
    if (userId && posts) {
      const postIds = posts.map(post => post.id)
      
      // Get user's likes
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds)

      // Get user's dislikes
      const { data: dislikes } = await supabase
        .from('dislikes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds)

      const likedPostIds = new Set(likes?.map(like => like.post_id) || [])
      const dislikedPostIds = new Set(dislikes?.map(dislike => dislike.post_id) || [])

      // Add user_liked and user_disliked properties to each post
      const postsWithUserStatus = posts.map(post => ({
        ...post,
        user_liked: likedPostIds.has(post.id),
        user_disliked: dislikedPostIds.has(post.id)
      }))

      return NextResponse.json({ posts: postsWithUserStatus })
    }

    return NextResponse.json({ posts: posts || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, author_id } = await request.json()

    if (!title || !content || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title,
        content,
        author_id,
        likes_count: 0,
        dislikes_count: 0,
        comments_count: 0,
        created_at: getKSTDate(),
        updated_at: getKSTDate(),
      })
      .select(`
        *,
        author:users(name)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: `Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

