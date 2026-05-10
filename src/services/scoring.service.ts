import axios from 'axios'
import type {
  BaseApiResponse,
  ScoringBlokDetail,
  ScoringBlokSummary,
  ScoringGantangan,
  ScoringVoteRequest,
  ScoringVoteResponse,
  SemiFinalStandings,
} from '@/interfaces/scoring.interface'

const API_URL = `${import.meta.env.VITE_API_URL}/scoring`

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const getScoringBlocks = async (lombaId: string): Promise<ScoringBlokSummary[]> => {
  const response = await axios.get<BaseApiResponse<ScoringBlokSummary[]>>(`${API_URL}/blok`, {
    headers: getAuthHeaders(),
    params: { lombaId },
  })
  return response.data.data
}

export const getScoringBlockDetail = async (lombaId: string, blokId: number): Promise<ScoringBlokDetail> => {
  const response = await axios.get<BaseApiResponse<ScoringBlokDetail>>(`${API_URL}/blok/${blokId}`, {
    headers: getAuthHeaders(),
    params: { lombaId },
  })
  return response.data.data
}

export const postScoringVote = async (lombaId: string, payload: ScoringVoteRequest): Promise<ScoringVoteResponse> => {
  const response = await axios.post<BaseApiResponse<ScoringVoteResponse>>(`${API_URL}/vote`, payload, {
    headers: getAuthHeaders(),
    params: { lombaId },
  })
  return response.data.data
}

export const postScoringWarning = async (lombaId: string, gantanganId: string, blokId?: number): Promise<ScoringGantangan> => {
  const response = await axios.post<BaseApiResponse<ScoringGantangan>>(
    `${API_URL}/warning`,
    { gantanganId, blokId },
    { headers: getAuthHeaders(), params: { lombaId } },
  )
  return response.data.data
}

export const postScoringDisqualify = async (lombaId: string, gantanganId: string, blokId?: number): Promise<ScoringGantangan> => {
  const response = await axios.post<BaseApiResponse<ScoringGantangan>>(
    `${API_URL}/disqualify`,
    { gantanganId, blokId },
    { headers: getAuthHeaders(), params: { lombaId } },
  )
  return response.data.data
}

export const getSemiFinalStandings = async (lombaId: string): Promise<SemiFinalStandings> => {
  const response = await axios.get<BaseApiResponse<SemiFinalStandings>>(`${API_URL}/semi-final`, {
    headers: getAuthHeaders(),
    params: { lombaId },
  })
  return response.data.data
}