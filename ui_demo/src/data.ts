import { SentenceComment, VersionItem, Work } from './types'

export const works: Work[] = [
  {
    id: 'w-302',
    title: 'Personal Statement - Computer Science',
    wordCount: 684,
    status: 'In Revision',
    lockedBy: 'MacBook-Pro-13',
    updatedAt: '2 min ago',
  },
  {
    id: 'w-288',
    title: 'Supplemental Essay - Why This School',
    wordCount: 493,
    status: 'Submitted',
    updatedAt: '4 hours ago',
  },
  {
    id: 'w-279',
    title: 'Common App Main Essay',
    wordCount: 731,
    status: 'Draft',
    updatedAt: 'Yesterday',
  },
]

export const versions: VersionItem[] = [
  {
    id: 'v16',
    type: 'Submitted',
    version: 'v1.6',
    note: 'Submitted after resolving 7 sentence comments + reflection.',
    createdAt: '2026-02-10 21:18',
  },
  {
    id: 'v15',
    type: 'Draft',
    version: 'draft-1.5',
    note: 'Autosave checkpoint before intro rewrite.',
    createdAt: '2026-02-10 20:42',
  },
  {
    id: 'v14',
    type: 'Submitted',
    version: 'v1.4',
    note: 'Second full AI evaluation. Reflection provided.',
    createdAt: '2026-02-09 17:03',
  },
  {
    id: 'v13',
    type: 'Draft',
    version: 'draft-1.3',
    note: 'Body paragraph restructuring in progress.',
    createdAt: '2026-02-09 16:11',
  },
]

export const faoComment =
  'Your revised essay has stronger thematic coherence, but the transition from personal motivation to academic goals still feels abrupt. The narrative voice is more confident, yet evidence depth is uneven in paragraph three.'

export const sentenceComments: SentenceComment[] = [
  {
    id: 's-18',
    sentence: 'I was always obsessed in solving difficult puzzle since child.',
    type: 'Grammar',
    severity: 'High',
    comment: 'Tense and preposition usage create a non-native rhythm; fix grammar before style tuning.',
    resolution: 'Pending',
    improvement: 'Unsolved',
  },
  {
    id: 's-19',
    sentence: 'This proved that computer science is good for my future.',
    type: 'Clarity',
    severity: 'Medium',
    comment: 'The claim is generic. Replace with concrete causal link to your project impact.',
    resolution: 'Pending',
    improvement: 'Partial',
  },
  {
    id: 's-20',
    sentence: 'In this way, I strongly deeply believe I can be excellent there.',
    type: 'Style',
    severity: 'Low',
    comment: 'Redundant adverbs dilute credibility. Compress and use one precise verb.',
    resolution: 'Pending',
    improvement: 'New Issue',
  },
]
