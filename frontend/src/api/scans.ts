import type { WebsiteScanResult } from '../types/websiteScanner'
import type { ExtensionScanPayload, ExtensionScanResult } from '../types/extensionScanner'
import type { FileScanResult } from '../types/fileScanner'
import { mapExtensionScanData } from '../utils/extensionReportMapper'

const JWT_KEY = 'cyberwatch_jwt_token'

export const scansApi = {
  scanUrl: async (url: string): Promise<any> => {
    const token = localStorage.getItem(JWT_KEY)
    let res: Response
    try {
      res = await fetch('http://127.0.0.1:8000/api/scan/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ url })
      })
    } catch (err: any) {
      throw new Error('Network error: Unable to connect to CyberWatch backend server on port 8000.')
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 401 || res.status === 403) {
        throw new Error('Your session has expired. Please log in again.')
      }
      throw new Error(data?.detail || `URL scan failed with status ${res.status}`)
    }

    const json = await res.json()
    return json.data
  },

  scanWebsite: async (url: string): Promise<WebsiteScanResult> => {
    const token = localStorage.getItem(JWT_KEY)
    let res: Response
    try {
      res = await fetch('http://127.0.0.1:8000/api/scans/website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ url })
      })
    } catch (err: any) {
      throw new Error('Network error: Unable to connect to CyberWatch backend server on port 8000.')
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 401 || res.status === 403) {
        throw new Error('Your session has expired. Please log in again.')
      }
      throw new Error(data?.detail || `Website scan failed with status ${res.status}`)
    }

    const json = await res.json()
    const data = json.data

    if (!data) {
      throw new Error('Malformed response: Backend returned an empty payload.')
    }

    return data as WebsiteScanResult
  },

  scanExtension: async (payload: ExtensionScanPayload): Promise<ExtensionScanResult> => {
    const token = localStorage.getItem(JWT_KEY)
    let res: Response
    const { _clientParsedManifest, ...apiPayload } = payload
    try {
      res = await fetch('http://127.0.0.1:8000/api/scans/extension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(apiPayload)
      })
    } catch (err: any) {
      throw new Error('Network error: Unable to connect to CyberWatch backend server on port 8000.')
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 401 || res.status === 403) {
        throw new Error('Your session has expired. Please log in again.')
      }
      throw new Error(data?.detail || `Extension scan failed with status ${res.status}`)
    }

    const json = await res.json()
    const { data } = json

    if (!data) {
      throw new Error('Malformed response: Backend returned an empty payload.')
    }

    return mapExtensionScanData(data, _clientParsedManifest)
  },

  scanFile: async (file: File): Promise<FileScanResult> => {
    const token = localStorage.getItem(JWT_KEY)
    const formData = new FormData()
    formData.append('file', file)

    let res: Response
    try {
      res = await fetch('http://127.0.0.1:8000/api/scan/file', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      })
    } catch (err: any) {
      throw new Error('Network error: Unable to connect to CyberWatch backend server on port 8000.')
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 401 || res.status === 403) {
        throw new Error('Your session has expired. Please log in again.')
      }
      throw new Error(data?.detail || `File scan failed with status ${res.status}`)
    }

    const json = await res.json()
    const { data } = json

    if (!data) {
      throw new Error('Malformed response: Backend returned an empty payload.')
    }

    return data as FileScanResult
  }
}

