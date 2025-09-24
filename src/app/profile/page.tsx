'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Post } from '@/types'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading, updateProfile } = useAuth()
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editProfileImage, setEditProfileImage] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')

  useEffect(() => {
    if (user) {
      fetchUserPosts()
    }
  }, [user])

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`/api/posts?author_id=${user?.id}`)
      if (response.ok) {
        const { posts } = await response.json()
        setUserPosts(posts)
      }
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setPostsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setEditName(user?.name || '')
    setEditProfileImage(user?.profile_image || null)
    setUpdateError('')
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditName('')
    setEditProfileImage(null)
    setUpdateError('')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 파일 크기 제한 (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setUpdateError('이미지 파일 크기는 2MB 이하여야 합니다.')
        return
      }
      
      // 이미지 파일 타입 확인
      if (!file.type.startsWith('image/')) {
        setUpdateError('이미지 파일만 업로드 가능합니다.')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setEditProfileImage(result)
        setUpdateError('')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setUpdateError('이름을 입력해주세요.')
      return
    }

    setIsUpdating(true)
    setUpdateError('')

    try {
      const { error } = await updateProfile(editName.trim(), editProfileImage)
      if (error) {
        setUpdateError(error)
      } else {
        setIsEditing(false)
        setEditName('')
        setEditProfileImage(null)
      }
    } catch (error) {
      setUpdateError('프로필 업데이트 중 오류가 발생했습니다.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
        <Link
          href="/auth/login"
          className="inline-block px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600"
        >
          로그인하기
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden">
              {user.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                가입일: {formatDate(user.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            프로필 수정
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">프로필 수정</h2>
            
            {/* Profile Image Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로필 사진
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {editProfileImage ? (
                    <img 
                      src={editProfileImage} 
                      alt="프로필 미리보기" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (최대 2MB)</p>
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div className="mb-4">
              <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                id="editName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이름을 입력하세요"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 주소
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">이메일 주소는 변경할 수 없습니다</p>
            </div>

            {/* Error Message */}
            {updateError && (
              <div className="mb-4 text-red-600 text-sm">{updateError}</div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isUpdating ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{userPosts.length}</div>
          <div className="text-sm text-gray-600">작성한 글</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">
            {userPosts.reduce((sum, post) => sum + post.likes_count, 0)}
          </div>
          <div className="text-sm text-gray-600">받은 좋아요</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">
            {userPosts.reduce((sum, post) => sum + post.comments_count, 0)}
          </div>
          <div className="text-sm text-gray-600">받은 댓글</div>
        </div>
      </div>

      {/* User Posts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">내가 작성한 글</h2>
        {postsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 pb-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : userPosts.length > 0 ? (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <div key={post.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <Link
                  href={`/posts/${post.id}`}
                  className="block hover:text-orange-500 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>
                </Link>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>{formatDate(post.created_at)}</span>
                  <span>좋아요 {post.likes_count}</span>
                  <span>댓글 {post.comments_count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">아직 작성한 글이 없습니다.</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600"
            >
              첫 글 작성하기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

