'use client'

import { useState, useEffect } from 'react'
import { Post } from '@/types'
import PostCard from '@/components/PostCard'
import PostForm from '@/components/PostForm'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [userCount, setUserCount] = useState(0)
  const [totalPostCount, setTotalPostCount] = useState(0)
  const [showPostForm, setShowPostForm] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchPosts()
    fetchUserCount()
    fetchTotalPostCount()
  }, [user])

  const fetchPosts = async (query = '') => {
    try {
      setLoading(true)
      const userId = user?.id || ''
      const url = query 
        ? `/api/posts?search=${encodeURIComponent(query)}&user_id=${userId}`
        : `/api/posts?user_id=${userId}`
      
      const response = await fetch(url)
      if (response.ok) {
        const { posts } = await response.json()
        setPosts(posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserCount = async () => {
    try {
      const response = await fetch('/api/users/count')
      if (response.ok) {
        const { count } = await response.json()
        setUserCount(count)
      }
    } catch (error) {
      console.error('Error fetching user count:', error)
    }
  }

  const fetchTotalPostCount = async () => {
    try {
      const response = await fetch('/api/posts/count')
      if (response.ok) {
        const { count } = await response.json()
        setTotalPostCount(count)
      }
    } catch (error) {
      console.error('Error fetching total post count:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    fetchPosts(searchQuery)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearching(false)
    fetchPosts() // 검색어 없이 모든 글 가져오기
  }

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes_count: post.likes_count + 1,
            user_liked: true,
            user_disliked: false
          }
        : post
    ))
  }

  const handleDislike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            dislikes_count: post.dislikes_count + 1,
            user_liked: false,
            user_disliked: true
          }
        : post
    ))
  }

  const handlePostCreated = () => {
    setShowPostForm(false)
    fetchPosts() // 새 글 목록 새로고침
    fetchTotalPostCount() // 전체 글 개수 새로고침
  }


  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <div className="bg-white border border-gray-300 rounded-md p-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="reddit-button reddit-button-primary"
              >
                검색
              </button>
            </form>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="reddit-post p-4 animate-pulse">
                  <div className="flex space-x-3">
                    <div className="w-6 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onDislike={handleDislike}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-300 rounded-md p-8 text-center">
              {isSearching ? (
                <>
                  <p className="text-gray-500 text-lg">해당하는 글이 없습니다.</p>
                  <p className="text-gray-400 mt-2">다른 검색어로 시도해보세요.</p>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-lg">아직 작성된 글이 없습니다.</p>
                  <p className="text-gray-400 mt-2">첫 번째 글을 작성해보세요!</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Community Info */}
          <div className="bg-white border border-gray-300 rounded-md p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">DB</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Dear Baby</h3>
                <p className="text-xs text-gray-500">공개 커뮤니티</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              아이들의 경험을 공유하는 따뜻한 커뮤니티입니다. 
              책을 읽고 느낀 점, 일상에서 겪은 재미있는 경험들을 자유롭게 나눠보세요.
            </p>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>구성원</span>
                <span className="font-bold">{userCount}명</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>게시글</span>
                <span className="font-bold">{totalPostCount}개</span>
              </div>
            </div>
          </div>

          {/* Write Post Button */}
          {user ? (
            <button
              onClick={() => setShowPostForm(true)}
              className="w-full reddit-button reddit-button-primary"
            >
              새 글 작성
            </button>
          ) : (
            <div className="bg-white border border-gray-300 rounded-md p-4 text-center">
              <p className="text-gray-500 text-sm mb-3">글을 작성하려면 로그인이 필요합니다.</p>
              <a
                href="/auth/login"
                className="reddit-button reddit-button-primary"
              >
                로그인하기
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Post Form Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">새 글 작성</h2>
              <button
                onClick={() => setShowPostForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <PostForm onPostCreated={handlePostCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}