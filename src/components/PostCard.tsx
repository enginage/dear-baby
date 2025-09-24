'use client'

import Link from 'next/link'
import { Post } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { formatKSTDate } from '@/utils/timezone'

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
  onDislike?: (postId: string) => void
}

export default function PostCard({ post, onLike, onDislike }: PostCardProps) {
  const { user } = useAuth()
  const [isLiking, setIsLiking] = useState(false)
  const [isDisliking, setIsDisliking] = useState(false)
  const [localLikesCount, setLocalLikesCount] = useState(post.likes_count)
  const [localDislikesCount, setLocalDislikesCount] = useState(post.dislikes_count)
  const [localUserLiked, setLocalUserLiked] = useState(post.user_liked || false)
  const [localUserDisliked, setLocalUserDisliked] = useState(post.user_disliked || false)

  const handleLike = async () => {
    if (!user || isLiking) return
    
    setIsLiking(true)
    try {
      if (localUserLiked) {
        // Unlike the post
        const response = await fetch(`/api/posts/${post.id}/like`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id }),
        })
        
        if (response.ok) {
          setLocalUserLiked(false)
          setLocalLikesCount(prev => prev - 1)
          onLike?.(post.id)
        }
      } else {
        // Like the post
        const response = await fetch(`/api/posts/${post.id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id }),
        })
        
        if (response.ok) {
          setLocalUserLiked(true)
          setLocalUserDisliked(false)
          setLocalLikesCount(prev => prev + 1)
          setLocalDislikesCount(prev => Math.max(0, prev - 1))
          onLike?.(post.id)
        }
      }
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleDislike = async () => {
    if (!user || isDisliking) return
    
    setIsDisliking(true)
    try {
      if (localUserDisliked) {
        // Undislike the post
        const response = await fetch(`/api/posts/${post.id}/dislike`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id }),
        })
        
        if (response.ok) {
          setLocalUserDisliked(false)
          setLocalDislikesCount(prev => prev - 1)
          onDislike?.(post.id)
        }
      } else {
        // Dislike the post
        const response = await fetch(`/api/posts/${post.id}/dislike`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id }),
        })
        
        if (response.ok) {
          setLocalUserDisliked(true)
          setLocalUserLiked(false)
          setLocalDislikesCount(prev => prev + 1)
          setLocalLikesCount(prev => Math.max(0, prev - 1))
          onDislike?.(post.id)
        }
      }
    } catch (error) {
      console.error('Error disliking post:', error)
    } finally {
      setIsDisliking(false)
    }
  }


  const formatDate = (dateString: string) => {
    return formatKSTDate(dateString)
  }

  return (
    <div className="reddit-post">
      <div className="flex">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-2 p-3" style={{minWidth: '60px'}}>
          <div className="flex flex-col items-center space-y-1">
            <button
              onClick={handleLike}
              disabled={!user || isLiking}
              className={`text-2xl hover:scale-110 transition-transform duration-200 ${
                localUserLiked ? 'opacity-100' : 'opacity-60 hover:opacity-100'
              } ${!user ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              👍
            </button>
            <span className="text-xs font-bold text-gray-700">{localLikesCount}</span>
          </div>
          
          <div className="flex flex-col items-center space-y-1">
            <button
              onClick={handleDislike}
              disabled={!user || isDisliking}
              className={`text-2xl hover:scale-110 transition-transform duration-200 ${
                localUserDisliked ? 'opacity-100' : 'opacity-60 hover:opacity-100'
              } ${!user ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              👎
            </button>
            <span className="text-xs font-bold text-gray-700">{localDislikesCount}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 p-3">
          <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
            <span className="font-bold">Dear Baby</span>
            <span>•</span>
            <span>{formatDate(post.created_at)}</span>
            <span>•</span>
            <span>{post.author?.name || 'Unknown'}</span>
          </div>
          
          <Link href={`/posts/${post.id}`} className="block">
            <h3 className="text-lg font-medium text-gray-900 hover:text-blue-500 mb-2 leading-tight">
              {post.title}
            </h3>
            <p className="text-gray-800 text-sm line-clamp-3 leading-relaxed">{post.content}</p>
          </Link>

          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
            <Link
              href={`/posts/${post.id}`}
              className="flex items-center space-x-1 hover:text-gray-700 font-medium"
            >
              <svg className="text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '12px', height: '12px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments_count} 댓글</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

