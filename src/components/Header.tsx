'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function Header() {
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">DB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Dear Baby</span>
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
                >
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
                  <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                  <svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      내 정보
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="reddit-button reddit-button-outline"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  className="reddit-button reddit-button-primary"
                >
                  가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

