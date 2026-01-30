import type { Card, StudyResult } from '@/types/card'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export async function fetchCards(category?: string): Promise<Card[]> {
  const url = category
    ? `${API_BASE_URL}/cards?category=${category}`
    : `${API_BASE_URL}/cards`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch cards')
  }
  return response.json()
}

export async function fetchDueCards(): Promise<Card[]> {
  const response = await fetch(`${API_BASE_URL}/cards/due`)
  if (!response.ok) {
    throw new Error('Failed to fetch due cards')
  }
  return response.json()
}

export async function submitStudyResult(result: StudyResult): Promise<Card> {
  const response = await fetch(`${API_BASE_URL}/study`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(result),
  })
  if (!response.ok) {
    throw new Error('Failed to submit study result')
  }
  return response.json()
}
