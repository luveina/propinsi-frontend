export interface TrendDataPoint {
  tanggal: string
  jumlah: number
}

export interface ClassSalesData {
  kelas: string
  persentase: number
  jumlah: number
  dailyBreakdown: TrendDataPoint[]
}

export interface BirdTypeSalesData {
  jenisBurung: string
  persentase: number
  jumlah: number
  dailyBreakdown: TrendDataPoint[]
}

export interface AnalyticsData {
  totalTiketTerjual: number
  totalRevenue: number
  occupancyRate: number
  attendanceRate: number
  top5Classes: ClassSalesData[]
  top5BirdTypes: BirdTypeSalesData[]
  trendData: TrendDataPoint[]
  allClasses: ClassSalesData[]
  allBirdTypes: BirdTypeSalesData[]
}
