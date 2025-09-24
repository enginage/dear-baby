// 한국 표준시(KST) 시간을 반환하는 유틸리티 함수들

export function getKSTDate(): string {
  const now = new Date()
  const kstOffset = 9 * 60 // KST는 UTC+9
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const kst = new Date(utc + (kstOffset * 60000))
  return kst.toISOString()
}

export function formatKSTDate(dateString: string): string {
  const date = new Date(dateString)
  const kstOffset = 9 * 60
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
  const kst = new Date(utc + (kstOffset * 60000))
  
  const now = new Date()
  const nowKst = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (kstOffset * 60000))
  
  const diffInHours = Math.floor((nowKst.getTime() - kst.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return '방금 전'
  if (diffInHours < 24) return `${diffInHours}시간 전`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`
  
  return kst.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
