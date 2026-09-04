export interface KpiCardData {
  id: string
  label: string
  value: string
  trend?: string
  trendType?: 'up' | 'down'
  subtext?: string
  iconName: 'FileText' | 'Clock' | 'FileCheck' | 'Download'
}

export interface RecentReportItem {
  id: string
  name: string
  type: string
  generatedOn: string
  format: 'PDF' | 'CSV' | 'DOCX'
}

export interface ReportTypeItem {
  id: string
  name: string
  count: number
  iconName: 'FileText' | 'Clock' | 'FileCheck' | 'Download' | 'Calendar' | 'Sliders'
}

export interface OverviewDataPoint {
  day: string
  count: number
}

export interface CategoryDataPoint {
  name: string
  value: number
  percentage: number
  color: string
}

export interface ScheduledReportItem {
  id: string
  name: string
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'On Demand'
  nextRun: string
  recipients: number
  status: 'Active' | 'Paused'
}

export interface ReportsResult {
  kpis: KpiCardData[]
  recentReports: RecentReportItem[]
  reportTypes: ReportTypeItem[]
  overview: OverviewDataPoint[]
  categories: CategoryDataPoint[]
  schedules: ScheduledReportItem[]
}
