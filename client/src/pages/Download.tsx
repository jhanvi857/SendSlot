import { useState, useEffect } from 'react'

interface FileItem {
  id: string;
  original_name: string;
  size_bytes: string | number;
  mime_type?: string;
}

interface Transfer {
  expires_at: string;
  protected?: boolean;
}

export default function Download({ slug, onNavigate }: { slug: string, onNavigate: (page: string) => void }) {
  const [transfer, setTransfer] = useState<Transfer | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [isProtected, setIsProtected] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const fetchTransfer = async (pass: string = '') => {
    try {
      const headers: HeadersInit = pass ? { 'x-transfer-password': pass } : {}
      const res = await fetch(`/api/transfers/${slug}`, { headers })
      
      if (res.status === 403 || res.status === 401) {
        setIsProtected(true)
        return
      }
      
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Failed to load transfer')
        return
      }

      const data = await res.json()
      if (data.protected) {
        setIsProtected(true)
      } else {
        setTransfer(data.transfer)
        setFiles(data.files)
        setIsProtected(false)
      }
    } catch (err) {
      setError('Connection error')
    }
  }

  useEffect(() => {
    fetchTransfer()
  }, [slug])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)
    await fetchTransfer(password)
    setVerifying(false)
  }

  const handleDownload = async (fileId: string) => {
    try {
      const res = await fetch(`/api/transfers/${slug}/download/${fileId}`)
      if (res.ok) {
        const { url } = await res.json()
        window.open(url, '_blank')
      }
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <h1 className="font-serif text-3xl font-bold text-ink-primary mb-4">Transfer unavailable</h1>
          <p className="font-sans text-ink-secondary mb-8">{error}</p>
          <button onClick={() => onNavigate('landing')} className="text-rust-primary font-sans hover:underline">
            Go back to SendSlot
          </button>
        </div>
      </div>
    )
  }

  if (isProtected && !transfer) {
    return (
      <div className="min-h-screen bg-paper-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full border border-border-primary bg-paper-2 p-10">
          <h1 className="font-serif text-2xl font-bold text-ink-primary mb-2">Password Protected</h1>
          <p className="font-sans text-sm text-ink-muted mb-8">This transfer requires a password to access.</p>
          
          <form onSubmit={handleVerify}>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-paper-1 border border-border-primary px-4 py-3 font-sans text-sm focus:outline-none focus:border-rust-primary mb-6"
            />
            <button
              disabled={verifying}
              className="w-full bg-rust-primary text-white py-3 font-sans hover:bg-rust-dark transition-colors"
            >
              {verifying ? 'Verifying...' : 'Unlock Transfer'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (!transfer) {
    return (
      <div className="min-h-screen bg-paper-1 flex items-center justify-center">
        <div className="font-sans text-ink-muted">Loading transfer...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper-1 flex flex-col">
      <nav className="border-b border-border-primary px-8 py-4">
        <div onClick={() => onNavigate('landing')} className="text-xl font-sans font-medium tracking-tight cursor-pointer inline-block">
          SendSlot<span className="text-rust-primary">.</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="mb-12">
            <h1 className="font-serif text-4xl font-bold text-ink-primary mb-3">Ready for download</h1>
            <p className="font-sans text-ink-secondary">
              Shared via SendSlot. Expires on {new Date(transfer.expires_at).toLocaleDateString()}.
            </p>
          </div>

          <div className="space-y-4 mb-12">
            {files.map(file => (
              <div key={file.id} className="border border-border-primary bg-paper-2 p-6 flex items-center justify-between">
                <div>
                  <div className="font-sans text-lg font-medium text-ink-primary">{file.original_name}</div>
                  <div className="font-sans text-xs text-ink-muted mt-1">
                    {(Number(file.size_bytes) / 1024 / 1024).toFixed(2)} MB • {file.mime_type || 'Unknown type'}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(file.id)}
                  className="bg-rust-primary text-white px-6 py-2 font-sans hover:bg-rust-dark transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>

          <div className="text-center border-t border-border-secondary pt-8">
            <p className="font-sans text-xs text-ink-muted">
              Transfer size: {(files.reduce((acc, f) => acc + Number(f.size_bytes), 0) / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
