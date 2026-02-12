export type Severity = 'High' | 'Medium' | 'Low'
export type IssueType = 'Grammar' | 'Clarity' | 'Style' | 'Tone' | 'Logic' | 'Conciseness'
export type Resolution = 'Resolved' | 'Rejected' | 'Pending'

export interface Work {
  id: string
  title: string
  wordCount: number
  status: 'Draft' | 'Submitted' | 'In Revision'
  lockedBy?: string
  updatedAt: string
}

export interface VersionItem {
  id: string
  type: 'Submitted' | 'Draft'
  version: string
  note: string
  createdAt: string
}

export interface SentenceComment {
  id: string
  sentence: string
  type: IssueType
  severity: Severity
  comment: string
  resolution: Resolution
  improvement?: 'Excellent' | 'Partial' | 'Unsolved' | 'New Issue'
}
