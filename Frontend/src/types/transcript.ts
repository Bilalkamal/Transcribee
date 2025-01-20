export interface TranscriptResponse {
  status: string
  video_id: string
  video_title: string
  transcription_raw: string
  transcription: {
    text: string
    segments: Array<{
      start: number
      end: number
      text: string
    }>
  }
} 