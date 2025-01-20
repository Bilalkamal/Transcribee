import { useState, useEffect, useCallback } from 'react'
import type { TranscriptResponse } from '@/app/page'

interface TranscriptionHistoryItem {
  id: string;
  videoId: string;
  videoTitle: string;
  thumbnail: string;
  timestamp: number;
  url: string;
  transcript: TranscriptResponse;
  duration: string;
  stats: {
    txt: { words: number; characters: number; };
    srt: { words: number; characters: number; };
    vtt: { words: number; characters: number; };
  };
}

const HISTORY_KEY = 'transcription_history'
const STORAGE_VERSION = '1.1'

export function useTranscriptionHistory() {
  const [history, setHistory] = useState<TranscriptionHistoryItem[]>([])
  const [count, setCount] = useState<number>(0)

  // Load history from localStorage on mount with error handling and versioning
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(HISTORY_KEY)
      if (savedData) {
        const parsed = JSON.parse(savedData)
        // Check if data has version, if not or if old version, migrate
        if (!parsed.version || parsed.version !== STORAGE_VERSION) {
          // Migrate old data
          const migratedHistory = {
            version: STORAGE_VERSION,
            items: Array.isArray(parsed) ? parsed : (parsed.items || [])
          }
          localStorage.setItem(HISTORY_KEY, JSON.stringify(migratedHistory))
          setHistory(migratedHistory.items)
          setCount(migratedHistory.items.length)
        } else {
          setHistory(parsed.items)
          setCount(parsed.items.length)
        }
      } else {
        initializeStorage()
      }
    } catch (error) {
      console.error('Error loading history:', error)
      initializeStorage()
    }
  }, [])

  // Initialize empty storage with version
  const initializeStorage = () => {
    const emptyHistory = {
      version: STORAGE_VERSION,
      items: []
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(emptyHistory))
    setHistory([])
    setCount(0)
  }

  // Save history with improved error handling
  const saveHistory = (newHistory: TranscriptionHistoryItem[]): boolean => {
    try {
      const storageData = {
        version: STORAGE_VERSION,
        items: newHistory
      }
      
      const serialized = JSON.stringify(storageData)
      
      // Handle storage size limits more gracefully
      try {
        localStorage.setItem(HISTORY_KEY, serialized)
        setCount(newHistory.length)
        return true
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          // If storage is full, remove oldest items until it fits
          const reducedHistory = newHistory.slice(0, Math.floor(newHistory.length * 0.8))
          return saveHistory(reducedHistory)
        }
        throw e
      }
    } catch (error) {
      console.error('Error saving history:', error)
      return false
    }
  }

  const addToHistory = useCallback((item: Omit<TranscriptionHistoryItem, 'id' | 'timestamp'>) => {
    setHistory(prev => {
      const newItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }
      
      // Remove duplicate if exists (based on videoId)
      const filteredHistory = prev.filter(h => h.videoId !== item.videoId)
      const newHistory = [newItem, ...filteredHistory]
      
      // Save to storage
      if (!saveHistory(newHistory)) {
        return prev // If save failed, don't update state
      }
      
      return newHistory
    })
  }, [])

  // Other methods remain similar but with improved error handling
  const getFromHistory = useCallback((videoId: string): TranscriptionHistoryItem | undefined => {
    return history.find(item => item.videoId === videoId)
  }, [history])

  const clearHistory = useCallback(() => {
    initializeStorage()
  }, [])

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id)
      saveHistory(newHistory)
      return newHistory
    })
  }, [])

  return {
    history,
    count,
    addToHistory,
    getFromHistory,
    clearHistory,
    removeFromHistory,
  }
} 