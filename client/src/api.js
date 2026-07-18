import axios from 'axios'

// baseURL '/api' -> Vite proxy forwards to http://localhost:5002/api in dev.
// If you ever deploy the client separately, point this at the backend's URL.
export const api = axios.create({ baseURL: '/api' })

// Pull the most useful message out of an axios error:
// backend's own { error } field first, then axios's message, then a fallback.
export function readError(err, fallback) {
  return err?.response?.data?.error || err?.message || fallback
}
