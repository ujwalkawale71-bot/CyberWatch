import type { HelpTopicItem, GuideItem, VideoItem, SupportTicketItem, ContactChannel } from '../types/help'

export const helpTopics: HelpTopicItem[] = [
  { id: 'topic-1', title: 'Getting Started', desc: 'New to CyberWatch? Learn the basics and get started quickly.', iconName: 'BookOpen' },
  { id: 'topic-2', title: 'Scanners Guide', desc: 'Learn how each scanner works and how to get accurate results.', iconName: 'Shield' },
  { id: 'topic-3', title: 'Policies & Rules', desc: 'Create and manage policies, rules and exceptions.', iconName: 'Sliders' },
  { id: 'topic-4', title: 'Alerts & Reports', desc: 'Understand alerts, risk scores and reports.', iconName: 'Bell' },
  { id: 'topic-5', title: 'Integrations', desc: 'Integrate with SIEM, SOAR, Slack, Teams and more.', iconName: 'Cpu' },
  { id: 'topic-6', title: 'Troubleshooting', desc: 'Find solutions to common issues and errors.', iconName: 'Wrench' },
  { id: 'topic-7', title: 'Account & Billing', desc: 'Manage your account, licenses and subscriptions.', iconName: 'Users' },
  { id: 'topic-8', title: 'API & Developer', desc: 'API documentation, endpoints and examples.', iconName: 'Code' }
]

export const helpGuides: GuideItem[] = [
  { id: 'guide-1', title: 'Getting Started with CyberWatch', desc: 'Complete guide to set up and start using the platform.', format: 'PDF', size: '1.2 MB', iconName: 'FileDown' },
  { id: 'guide-2', title: 'Scanner Configuration Guide', desc: 'Detailed configuration for all scanner modules.', format: 'PDF', size: '2.4 MB', iconName: 'FileText' },
  { id: 'guide-3', title: 'Policy Engine Best Practices', desc: 'Best practices for creating effective security policies.', format: 'PDF', size: '1.8 MB', iconName: 'ShieldAlert' },
  { id: 'guide-4', title: 'API Integration Guide', desc: 'Step-by-step guide to integrate with our API.', format: 'PDF', size: '1.6 MB', iconName: 'FileText' },
  { id: 'guide-5', title: 'Troubleshooting Common Issues', desc: 'Solutions to common problems and error codes.', format: 'PDF', size: '2.0 MB', iconName: 'FileDown' }
]

export const helpVideos: VideoItem[] = [
  { id: 'vid-1', title: 'Platform Overview', desc: 'Quick overview of all features and dashboard.', duration: '04:35' },
  { id: 'vid-2', title: 'Running Your First Scan', desc: 'Learn how to scan URLs, websites and extensions.', duration: '06:12' },
  { id: 'vid-3', title: 'Understanding Reports', desc: 'How to read reports and take action.', duration: '05:48' },
  { id: 'vid-4', title: 'Creating Custom Policies', desc: 'Create powerful policies with advanced rules.', duration: '07:20' }
]

export const supportTickets: SupportTicketItem[] = [
  { id: 'TKT-1256', title: 'False positive in Website Scanner', priority: 'HIGH', status: 'Open', date: '2025-05-15' },
  { id: 'TKT-1255', title: 'API rate limit issue', priority: 'MEDIUM', status: 'In Progress', date: '2025-05-14' },
  { id: 'TKT-1253', title: 'How to whitelist a domain', priority: 'LOW', status: 'Resolved', date: '2025-05-12' },
  { id: 'TKT-1251', title: 'Report export not working', priority: 'LOW', status: 'Closed', date: '2025-05-10' }
]

export const contactOptions: ContactChannel[] = [
  { id: 'con-1', label: 'Live Chat', desc: 'Available 24/7', iconName: 'MessageSquare' },
  { id: 'con-2', label: 'Email Support', desc: 'support@cyberwatch.ai - Response in ~2h', iconName: 'Mail' },
  { id: 'con-3', label: 'Request a Call', desc: 'Book a Call', iconName: 'Phone' },
  { id: 'con-4', label: 'Community Forum', desc: 'Connect with community & experts', iconName: 'Globe' }
]
