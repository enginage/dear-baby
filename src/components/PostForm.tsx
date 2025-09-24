'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface PostFormProps {
  onPostCreated?: () => void
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          author_id: user.id,
        }),
      })

      if (response.ok) {
        const { post } = await response.json()
        setTitle('')
        setContent('')
        onPostCreated?.() // 콜백 호출
        // onPostCreated가 있으면 모달에서 호출된 것이므로 리다이렉트는 부모에서 처리
        // onPostCreated가 없으면 직접 리다이렉트
        if (!onPostCreated) {
          router.push(`/posts/${post.id}`)
        }
      } else {
        const { error } = await response.json()
        console.error('Post creation error:', error)
        alert(`글 작성 실패: ${error}`)
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-white border border-gray-300 rounded-md p-4 text-center">
        <p className="text-gray-500 text-sm mb-4">글을 작성하려면 로그인이 필요합니다.</p>
        <a
          href="/auth/login"
          className="reddit-button reddit-button-primary"
        >
          로그인하기
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-300 rounded-md p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
          {user.profile_image ? (
            <img 
              src={user.profile_image} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-xs font-medium">{user.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="text-sm font-medium text-gray-700">{user.name}</span>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            maxLength={200}
          />
        </div>
        <div className="mb-3">
          <textarea
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            maxLength={4000}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => {
              setTitle('')
              setContent('')
            }}
            className="reddit-button reddit-button-secondary"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="reddit-button reddit-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '작성 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}

