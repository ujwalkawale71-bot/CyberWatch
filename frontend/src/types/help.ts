export interface HelpTopicItem {
  id: string
  title: string
  desc: string
  iconName: 'BookOpen' | 'Shield' | 'Sliders' | 'Bell' | 'Cpu' | 'Wrench' | 'Users' | 'Code'
}

export interface GuideItem {
  id: string
  title: string
  desc: string
  format: string
  size: string
  iconName: 'FileDown' | 'FileText' | 'ShieldAlert'
}

export interface VideoItem {
  id: string
  title: string
  desc: string
  duration: string
}

export interface SupportTicketItem {
  id: string
  title: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  date: string
}

export interface ContactChannel {
  id: string
  label: string
  desc: string
  iconName: 'MessageSquare' | 'Mail' | 'Phone' | 'Globe'
}
