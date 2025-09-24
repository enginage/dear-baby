'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Post, Comment } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import CommentComponent from '@/components/Comment'
import { formatKSTDate } from '@/utils/timezone'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPost()
      fetchComments()
    }
  }, [params.id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`)
      if (response.ok) {
        const { post } = await response.json()
        setPost(post)
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}/comments`)
      if (response.ok) {
        const { comments } = await response.json()
        setComments(comments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!commentContent.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    setIsSubmittingComment(true)

    try {
      const response = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentContent.trim(),
          author_id: user.id,
        }),
      })

      if (response.ok) {
        const { comment } = await response.json()
        setComments([...comments, comment])
        setCommentContent('')
        
        // Update post comments count
        if (post) {
          setPost({ ...post, comments_count: post.comments_count + 1 })
        }
      } else {
        const { error } = await response.json()
        alert(`댓글 작성 실패: ${error}`)
      }
    } catch (error) {
      console.error('Error creating comment:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId))
    if (post) {
      setPost({ ...post, comments_count: post.comments_count - 1 })
    }
  }

  const handleDeletePost = async () => {
    if (!user || !post || isDeleting) return
    
    const confirmed = window.confirm('정말로 이 글을 삭제하시겠습니까?')
    if (!confirmed) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (response.ok) {
        alert('글이 삭제되었습니다.')
        router.push('/')
      } else {
        alert('글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('글 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">글을 찾을 수 없습니다</h1>
        <Link href="/" className="text-orange-500 hover:text-orange-600">
          홈으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Post Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Dear Baby</Link>
            <span>•</span>
            <span>{formatKSTDate(post.created_at)}</span>
            <span>•</span>
            <span>{post.author?.name || 'Unknown'}</span>
          </div>
          
          {/* Delete button - only show for post author */}
          {user && user.id === post.author_id && (
            <button
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="flex items-center space-x-1 text-red-500 hover:text-red-700 font-medium text-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{isDeleting ? '삭제 중...' : '글 삭제'}</span>
            </button>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>

      {/* Comment Form */}
      {user ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">댓글 작성</h3>
          <form onSubmit={handleSubmitComment}>
            <textarea
              placeholder="댓글을 입력하세요..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none mb-4"
              maxLength={1000}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingComment || !commentContent.trim()}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingComment ? '작성 중...' : '댓글 작성'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 text-center">
          <p className="text-gray-500 mb-4">댓글을 작성하려면 로그인이 필요합니다.</p>
          <Link
            href="/auth/login"
            className="inline-block px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600"
          >
            로그인하기
          </Link>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          댓글 {comments.length}개
        </h3>
        {comments.length > 0 ? (
          <div className="space-y-0">
            {comments.map((comment) => (
              <CommentComponent
                key={comment.id}
                comment={comment}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
        )}
      </div>
    </div>
  )
}

