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

export interface GantanganRanking {
  nomorGantangan: number;
  blokId: number;
  jumlahAjuan: number;
}

export interface SemiFinalStandings {
  lombaId: string;
  namaLomba: string;
  juriSubmitted: number;
  totalJuri: number;
  nextStep: 'WAITING' | 'KONCER' | 'FINISH';
  rankings: GantanganRanking[];
}

export interface BaseApiResponse<T> {
  status: number
  message: string
  data: T
}
