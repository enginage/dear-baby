'use client'

import { useState } from 'react'
import { Comment as CommentType } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/utils/date'

interface CommentProps {
  comment: CommentType
  onDelete?: (commentId: string) => void
}

export default function Comment({ comment, onDelete }: CommentProps) {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!user || user.id !== comment.author_id) return
    
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete?.(comment.id)
      } else {
        alert('댓글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }


  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-gray-700">
            {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
            <span className="font-medium">{comment.author?.name || 'Unknown'}</span>
            <span>•</span>
            <span>{formatDate(comment.created_at)}</span>
            {user?.id === comment.author_id && (
              <>
                <span>•</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              </>
            )}
          </div>
          <p className="text-gray-900 whitespace-pre-wrap">{comment.content}</p>
        </div>
      </div>
    </div>
  )
}

