export interface User {
  id: string
  email: string
  name: string
  profile_image?: string | null
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  author_id: string
  author?: User
  created_at: string
  updated_at: string
  likes_count: number
  dislikes_count: number
  comments_count: number
  user_liked?: boolean
  user_disliked?: boolean
}

export interface Comment {
  id: string
  content: string
  post_id: string
  author_id: string
  author?: User
  created_at: string
  updated_at: string
}

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Dislike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name: string, profileImage?: string | null) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (name: string, profileImage?: string | null) => Promise<{ error: any }>
}

