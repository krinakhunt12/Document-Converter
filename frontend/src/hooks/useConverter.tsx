import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { API_BASE } from '../config'

type Message = { text: string; type: 'success' | 'error' } | null

interface MutationParams {
  endpoint: string
  file: File
  outName: string
  customName?: string
}

export default function useConverter() {
  const [message, setMessage] = useState<Message>(null)

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, [])

  // Transition to TanStack useMutation
  const mutation = useMutation({
    mutationFn: async ({ endpoint, file, outName, customName }: MutationParams) => {
      const fd = new FormData()
      fd.append('file', file)

      // Add custom filename as query param if provided
      const url = new URL(API_BASE + endpoint)
      if (customName) {
        url.searchParams.append('filename', customName)
      }

      const res = await fetch(url.toString(), { method: 'POST', body: fd })
      
      if (!res.ok) {
        let errMessage = `Server error: ${res.status} ${res.statusText}`
        try {
          const errData = await res.json()
          if (errData.detail) errMessage = errData.detail
        } catch (_) {}
        throw new Error(errMessage)
      }

      // Check if response is a file download
      const contentDisposition = res.headers.get('Content-Disposition')
      let finalOutName = outName
      
      if (customName && customName.trim() !== '') {
        const trimmed = customName.trim()
        const extMatch = outName.match(/\.[^.]+$/)
        const ext = extMatch ? extMatch[0] : ''
        
        if (ext && !trimmed.toLowerCase().endsWith(ext.toLowerCase())) {
          finalOutName = trimmed + ext
        } else {
          finalOutName = trimmed
        }
      } else if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
        if (filenameMatch && filenameMatch[1]) {
          finalOutName = filenameMatch[1]
        }
      }

      const blob = await res.blob()
      return { blob, finalOutName }
    },
    onMutate: () => {
      setMessage(null)
    },
    onSuccess: ({ blob, finalOutName }) => {
      downloadBlob(blob, finalOutName)
      setMessage({ text: '✅ File converted successfully! Your download should begin shortly.', type: 'success' })
    },
    onError: (err: any) => {
      setMessage({ text: '❌ ' + (err.message || err), type: 'error' })
    }
  })

  // Expose triggers and loading state dynamically from TanStack mutation state
  const postFile = useCallback((endpoint: string, file: File, outName: string, customName?: string) => {
    mutation.mutate({ endpoint, file, outName, customName })
  }, [mutation])

  const activeEndpoint = mutation.isPending && mutation.variables
    ? mutation.variables.endpoint.split('?')[0]
    : null

  return {
    loading: mutation.isPending,
    activeEndpoint,
    message,
    postFile,
    setMessage
  }
}
