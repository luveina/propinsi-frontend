export type GantanganStatus = 'ACTIVE' | 'DISQUALIFIED'

export interface ScoringBlokSummary {
  blokId: number
  blokLabel: string
  locked: boolean
}

export interface ScoringGantangan {
  id: string
  nomorGantangan: number
  status: GantanganStatus
  warningCount: number
  isBooked: boolean
}

export interface ScoringBlokDetail {
  blokId: number
  blokLabel: string
  lombaId: string
  namaLomba: string
  locked: boolean
  gantangan: ScoringGantangan[]
}

export interface ScoringVoteRequest {
  blokId: number
  gantanganIds: string[]
}

export interface ScoringVoteResponse {
  message: string
  blokId: number
  locked: boolean
}

export interface BaseApiResponse<T> {
  status: number
  message: string
  data: T
}
