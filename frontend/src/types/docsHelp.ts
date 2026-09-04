export type ChapterStatus = 'Available' | 'Development' | 'Planned'

export interface DocChapter {
  id: string
  title: string
  status: ChapterStatus
  description: string
  requestPayload?: string
  responsePayload?: string
}

export interface HelpTopic {
  id: string
  title: string
  desc: string
  iconName: 'BookOpen' | 'Shield' | 'Sliders' | 'Bell' | 'Cpu' | 'Wrench' | 'Users' | 'Code'
}

export interface HelpGuide {
  id: string
  title: string
  desc: string
  size: string
  iconName: 'FileDown' | 'FileText' | 'ShieldAlert'
}

export interface HelpVideo {
  id: string
  title: string
  desc: string
  duration: string
}

export interface SupportTicket {
  id: string
  title: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
}

export interface ContactOption {
  id: string
  label: string
  desc: string
  actionText: string
  iconName: 'MessageSquare' | 'Mail' | 'Phone' | 'Globe'
}
