import type { ReportsResult } from '../types/reports'

export const reportsDemoData: ReportsResult = {
  kpis: [
    { id: 'rep-kpi-1', label: 'Total Reports', value: '342', trend: '+20.4%', trendType: 'up', iconName: 'FileText' },
    { id: 'rep-kpi-2', label: 'Scheduled Reports', value: '28', subtext: 'Active schedules', iconName: 'Clock' },
    { id: 'rep-kpi-3', label: 'Reports Generated', value: '314', subtext: 'This month', iconName: 'FileCheck' },
    { id: 'rep-kpi-4', label: 'Downloads', value: '1,248', subtext: 'This month', iconName: 'Download' }
  ],
  recentReports: [
    { id: 'rec-rep-1', name: 'Daily Security Report', type: 'Daily', generatedOn: 'May 15, 2025', format: 'PDF' },
    { id: 'rec-rep-2', name: 'Weekly Threat Report', type: 'Weekly', generatedOn: 'May 12, 2025', format: 'PDF' },
    { id: 'rec-rep-3', name: 'Malicious Extension Report', type: 'On Demand', generatedOn: 'May 10, 2025', format: 'PDF' },
    { id: 'rec-rep-4', name: 'Phishing URL Report', type: 'On Demand', generatedOn: 'May 08, 2025', format: 'PDF' },
    { id: 'rec-rep-5', name: 'Threat Intelligence Report', type: 'On Demand', generatedOn: 'May 07, 2025', format: 'CSV' },
    { id: 'rec-rep-6', name: 'Incident Report', type: 'On Demand', generatedOn: 'May 05, 2025', format: 'PDF' },
    { id: 'rec-rep-7', name: 'Monthly Executive Summary', type: 'Monthly', generatedOn: 'April 30, 2025', format: 'PDF' },
    { id: 'rec-rep-8', name: 'Custom Domain Analysis', type: 'On Demand', generatedOn: 'April 28, 2025', format: 'PDF' }
  ],
  reportTypes: [
    { id: 'type-1', name: 'Daily Reports', count: 102, iconName: 'Clock' },
    { id: 'type-2', name: 'Weekly Reports', count: 48, iconName: 'Calendar' },
    { id: 'type-3', name: 'Monthly Reports', count: 12, iconName: 'Calendar' },
    { id: 'type-4', name: 'On Demand Reports', count: 136, iconName: 'Sliders' },
    { id: 'type-5', name: 'Incident Reports', count: 24, iconName: 'FileText' },
    { id: 'type-6', name: 'Executive Reports', count: 20, iconName: 'FileCheck' }
  ],
  overview: [
    { day: 'Day 1', count: 8 },
    { day: 'Day 3', count: 12 },
    { day: 'Day 5', count: 10 },
    { day: 'Day 7', count: 14 },
    { day: 'Day 9', count: 18 },
    { day: 'Day 11', count: 15 },
    { day: 'Day 13', count: 22 },
    { day: 'Day 15', count: 20 },
    { day: 'Day 17', count: 24 },
    { day: 'Day 19', count: 28 },
    { day: 'Day 22', count: 38 }, // Peak callout target
    { day: 'Day 24', count: 22 },
    { day: 'Day 26', count: 25 },
    { day: 'Day 28', count: 30 },
    { day: 'Day 30', count: 27 }
  ],
  categories: [
    { name: 'Security Overview', value: 98, percentage: 28.7, color: '#3b82f6' },
    { name: 'Threat Analysis', value: 82, percentage: 24.0, color: '#f97316' },
    { name: 'Extension Analysis', value: 63, percentage: 18.4, color: '#a855f7' },
    { name: 'Phishing Analysis', value: 53, percentage: 15.5, color: '#ec4899' },
    { name: 'Incident Analysis', value: 32, percentage: 9.4, color: '#ef4444' },
    { name: 'Others', value: 14, percentage: 4.0, color: '#64748b' }
  ],
  schedules: [
    { id: 'sched-1', name: 'Daily Security Report', frequency: 'Daily', nextRun: 'May 16, 2025, 08:00 AM', recipients: 3, status: 'Active' },
    { id: 'sched-2', name: 'Weekly Threat Report', frequency: 'Weekly', nextRun: 'May 19, 2025, 09:00 AM', recipients: 5, status: 'Active' },
    { id: 'sched-3', name: 'Monthly Executive Summary', frequency: 'Monthly', nextRun: 'June 01, 2025, 12:00 AM', recipients: 8, status: 'Active' },
    { id: 'sched-4', name: 'Malicious Extension Report', frequency: 'Weekly', nextRun: 'May 22, 2025, 02:00 PM', recipients: 2, status: 'Active' },
    { id: 'sched-5', name: 'Phishing URL Report', frequency: 'Daily', nextRun: 'May 16, 2025, 08:00 AM', recipients: 3, status: 'Paused' }
  ]
}
