import { useState, useEffect, useRef } from 'react'

interface DashboardFile {
  id: string | number;
  name: string;
  size: string;
  uploaded: string;
  downloads: number;
  progress: number;
  status: string;
  uploadTime: string;
  fileObj?: File;
  slug: string;
  fileId?: string;
  transferId?: string;
  expiresAt?: string;
  downloadCount?: number;
  scanStatus?: string;
}

interface ToggleStates {
  passwordProtect: boolean;
  virusScan: boolean;
  notifyOnDownload: boolean;
}

interface TransferDefaults {
  expiryDays: number;
  downloadLimit: string;
  passwordProtect: boolean;
  password: string;
  virusScan: boolean;
  notifyOnDownload: boolean;
}

interface TransferHistoryFile {
  id: string;
  original_name: string;
  size_bytes: string | number;
  mime_type?: string;
  checksum?: string;
  scan_status?: string;
  created_at: string;
}

interface TransferHistoryRow {
  transfer: {
    id: string;
    slug: string;
    status: string;
    expires_at: string;
    created_at: string;
    download_limit: number | null;
    download_count: number;
    user_email?: string | null;
  };
  files: TransferHistoryFile[];
}

const DEFAULT_DASHBOARD_SETTINGS: TransferDefaults = {
  expiryDays: 7,
  downloadLimit: 'unlimited',
  passwordProtect: false,
  password: '',
  virusScan: true,
  notifyOnDownload: true,
}

const DASHBOARD_SETTINGS_KEY = 'sendslot_dashboard_settings'

function loadDashboardSettings(): TransferDefaults {
  if (typeof window === 'undefined') return DEFAULT_DASHBOARD_SETTINGS
  const raw = window.localStorage.getItem(DASHBOARD_SETTINGS_KEY)
  if (!raw) return DEFAULT_DASHBOARD_SETTINGS
  try {
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_DASHBOARD_SETTINGS,
      ...parsed,
      expiryDays: Number(parsed.expiryDays) || DEFAULT_DASHBOARD_SETTINGS.expiryDays,
      downloadLimit: parsed.downloadLimit || DEFAULT_DASHBOARD_SETTINGS.downloadLimit,
    }
  } catch {
    return DEFAULT_DASHBOARD_SETTINGS
  }
}

interface DashboardProps {
  user: {
    token: string;
    user: {
      email: string;
    };
  } | null;
  onLogout: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onNavigate: (page: string) => void;
}

export default function Dashboard({ user, onLogout, activeNav, setActiveNav, onNavigate }: DashboardProps) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<DashboardFile[]>([])
  const [remoteTransfers, setRemoteTransfers] = useState<TransferHistoryRow[]>([])
  const [copyStates, setCopyStates] = useState<Record<string | number, boolean>>({})
  const [toggleStates, setToggleStates] = useState<ToggleStates>(() => {
    const settings = loadDashboardSettings()
    return {
      passwordProtect: settings.passwordProtect,
      virusScan: settings.virusScan,
      notifyOnDownload: settings.notifyOnDownload,
    }
  })
  const [expiryDays, setExpiryDays] = useState<number>(() => loadDashboardSettings().expiryDays)
  const [downloadLimit, setDownloadLimit] = useState<string>(() => loadDashboardSettings().downloadLimit)
  const [transferPassword, setTransferPassword] = useState<string>(() => loadDashboardSettings().password)
  const [userEmail, setUserEmail] = useState(user?.user?.email || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [workerStats, setWorkerStats] = useState<any>([])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i]
  }

  const buildRemoteFiles = (rows: TransferHistoryRow[]) => rows.flatMap((row) =>
    row.files.map((file) => ({
      id: file.id,
      name: file.original_name,
      size: formatFileSize(Number(file.size_bytes)),
      uploaded: new Date(row.transfer.created_at).toLocaleString(),
      downloads: row.transfer.download_count || 0,
      progress: row.transfer.status === 'ready' ? 100 : 0,
      status: row.transfer.status,
      uploadTime: new Date(file.created_at).toLocaleString(),
      slug: row.transfer.slug,
      fileId: file.id,
      transferId: row.transfer.id,
      expiresAt: row.transfer.expires_at,
      downloadCount: row.transfer.download_count || 0,
      scanStatus: file.scan_status,
    }))
  )

  const getTransferUrl = (slug: string) => `${window.location.origin}/d/${slug}`

  const openTransferUrl = (slug: string) => {
    window.open(getTransferUrl(slug), '_blank', 'noopener,noreferrer')
  }

  const remoteFiles = buildRemoteFiles(remoteTransfers)

  const syncedTransfers = remoteFiles.length > 0
    ? [...remoteFiles, ...files.filter((localFile) => {
        return !remoteFiles.some((remoteFile) => remoteFile.slug === localFile.slug && remoteFile.name === localFile.name)
      })]
    : files

  const isExpired = (file: DashboardFile) => {
    if (file.status === 'expired') return true
    if (!file.expiresAt) return false
    return new Date(file.expiresAt) < new Date()
  }

  const visibleActiveTransfers = syncedTransfers.filter((file) => !isExpired(file))
  const visibleExpiredTransfers = syncedTransfers.filter((file) => isExpired(file))

  const persistSettings = (nextToggleStates: ToggleStates, nextExpiryDays: number, nextDownloadLimit: string, nextPassword: string) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(DASHBOARD_SETTINGS_KEY, JSON.stringify({
      expiryDays: nextExpiryDays,
      downloadLimit: nextDownloadLimit,
      passwordProtect: nextToggleStates.passwordProtect,
      password: nextPassword,
      virusScan: nextToggleStates.virusScan,
      notifyOnDownload: nextToggleStates.notifyOnDownload,
    }))
  }

  const loadTransfers = async () => {
    if (!user?.token) return
    const res = await fetch('/api/transfers/mine', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
    if (!res.ok) {
      if (res.status === 401) {
        setRemoteTransfers([])
      }
      return
    }
    const data = await res.json()
    setRemoteTransfers(data)
    setFiles(prev => {
      const next = prev.map(file => {
        const match = data.find((row: TransferHistoryRow) => row.transfer.slug === file.slug)
        if (!match) return file
        return {
          ...file,
          status: match.transfer.status,
          expiresAt: match.transfer.expires_at,
          downloadCount: match.transfer.download_count,
        }
      })
      return next
    })
  }

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      uploadFiles(droppedFiles)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
    }
  }

  const uploadFiles = async (fileList: FileList) => {
    const list = Array.from(fileList)
    const payloadFiles = list.map(f => ({ name: f.name, size: f.size, type: f.type }))
    const notify = toggleStates.notifyOnDownload
    const email = userEmail
    const res = await fetch('/api/transfers', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify({
        files: payloadFiles,
        expiryDays,
        downloadLimit: downloadLimit === 'unlimited' ? null : Number(downloadLimit),
        password: toggleStates.passwordProtect ? transferPassword : undefined,
        notify,
        email,
      })
    })
    if (!res.ok) {
      console.error('create transfer failed')
      return
    }
    const data = await res.json()
    const { slug, presignedUrls } = data
    const newFiles = list.map((file, idx) => ({
      id: Date.now() + idx,
      name: file.name,
      size: formatFileSize(file.size),
      uploaded: 'just now',
      downloads: 0,
      progress: 0,
      status: 'uploading',
      uploadTime: new Date().toLocaleString(),
      fileObj: file,
      slug,
      fileId: presignedUrls[idx]?.fileId
    }))
    setFiles(prev => [...prev, ...newFiles])

    await Promise.all(newFiles.map(async nf => {
      const p = presignedUrls.find((pu: any) => pu.name === nf.name && pu.fileId === nf.fileId)
      if (!p) return
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', p.url)
        xhr.upload.onprogress = (e) => {
          const prog = e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0
          setFiles(prev => prev.map(x => x.id === nf.id ? { ...x, progress: prog } : x))
        }
        xhr.onload = () => {
          setFiles(prev => prev.map(x => x.id === nf.id ? { ...x, progress: 100, status: 'uploaded' } : x))
          resolve()
        }
        xhr.onerror = (err) => { setFiles(prev => prev.map(x => x.id === nf.id ? { ...x, status: 'error' } : x)); reject(err) }
        xhr.send(nf.fileObj)
      })
    }))

    // notify API that upload is complete
    await fetch(`/api/transfers/${slug}/complete`, { method: 'POST' })
    setFiles(prev => prev.map(x => x.slug === slug ? { ...x, status: 'processing' } : x))
    await loadTransfers()
  }

  const handleCopy = (fileId: string | number, filename: string) => {
    const f = syncedTransfers.find(x => x.id === fileId)
    const BASE = import.meta.env.VITE_BASE_URL || window.location.origin
    const url = f?.slug ? `${BASE}/d/${f.slug}` : `${BASE}/s/xyz123/${filename}`
    navigator.clipboard.writeText(url)
    setCopyStates((prev) => ({ ...prev, [fileId]: true }))
    setTimeout(() => {
      setCopyStates((prev) => ({ ...prev, [fileId]: false }))
    }, 1500)
  }

  // admin fetchers
  useEffect(() => {
    let mounted = true
    const ADMIN = import.meta.env.VITE_ADMIN_TOKEN || ''
    async function fetchAdmin() {
      try {
        const headers: HeadersInit = ADMIN ? { Authorization: `Bearer ${ADMIN}` } : {}
        const w = await fetch('/api/admin/workers', { headers })
        if (w.ok) {
          const jw = await w.json()
          if (mounted) setWorkerStats(jw.queues || [])
        }
      } catch (err) { console.error(err) }
    }
    fetchAdmin()
    const iv = setInterval(fetchAdmin, 10000)
    return () => { mounted = false; clearInterval(iv) }
  }, [])

  const toggleSwitch = (key: keyof ToggleStates) => {
    setToggleStates((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      persistSettings(next, expiryDays, downloadLimit, transferPassword)
      return next
    })
  }

  const handleExpiryChange = (value: string) => {
    const nextExpiry = Number(value)
    setExpiryDays(nextExpiry)
    persistSettings(toggleStates, nextExpiry, downloadLimit, transferPassword)
  }

  const handleDownloadLimitChange = (value: string) => {
    setDownloadLimit(value)
    persistSettings(toggleStates, expiryDays, value, transferPassword)
  }

  const handlePasswordChange = (value: string) => {
    setTransferPassword(value)
    persistSettings(toggleStates, expiryDays, downloadLimit, value)
  }

  const handleNotificationEmailChange = (value: string) => {
    setUserEmail(value)
  }

  const handleDeleteTransfer = async (slug: string) => {
    const res = await fetch(`/api/transfers/${slug}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`,
      },
    })
    if (!res.ok) {
      console.error('delete failed')
      return
    }
    setFiles(prev => prev.filter(file => file.slug !== slug))
    await loadTransfers()
  }

  // Poll status for processing files
  useEffect(() => {
    const processingFiles = files.filter(f => f.status === 'processing' || f.status === 'scanning')
    if (processingFiles.length === 0) return

    const iv = setInterval(async () => {
      const uniqueSlugs = [...new Set(processingFiles.map(f => f.slug))]
      for (const slug of uniqueSlugs) {
        try {
          const res = await fetch(`/api/transfers/${slug}`)
          if (res.ok) {
            const data = await res.json()
            setFiles(prev => prev.map(f => 
              f.slug === slug ? { ...f, status: data.transfer.status } : f
            ))
          }
        } catch (err) { console.error('poll failed', err) }
      }
    }, 3000)
    return () => clearInterval(iv)
  }, [files])

  const getBadgeStyles = (status: string) => {
    const styles: Record<string, string> = {
      ready: 'bg-sage-tint text-sage-primary border-sage-primary',
      processing: 'bg-amber-tint text-amber-primary border-amber-primary',
      uploading: 'bg-amber-tint text-amber-primary border-amber-primary',
      scanning: 'bg-rust-light text-rust-primary border-rust-primary',
      expired: 'bg-paper-2 text-ink-muted border-border-primary',
      pending: 'bg-paper-2 text-ink-muted border-border-primary',
    }
    return styles[status] || ''
  }

  useEffect(() => {
    setUserEmail(user?.user?.email || '')
  }, [user])

  useEffect(() => {
    persistSettings(toggleStates, expiryDays, downloadLimit, transferPassword)
  }, [toggleStates, expiryDays, downloadLimit, transferPassword])

  useEffect(() => {
    loadTransfers()
  }, [user?.token])

  useEffect(() => {
    if (!user?.token) return
    const interval = window.setInterval(() => {
      loadTransfers()
    }, 5000)
    return () => window.clearInterval(interval)
  }, [user?.token])

  return (
    <div className="flex flex-col min-h-screen bg-paper-1">
      {/* Navigation Bar */}
      <nav className="h-52px border-b border-border-primary bg-paper-1 flex items-center px-8 gap-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <span
            onClick={() => onNavigate('landing')}
            className="font-sans text-xl font-medium tracking-tight cursor-pointer hover:text-rust-primary transition-colors"
          >
            SendSlot<span className="text-rust-primary">.</span>
          </span>
        </div>

        {/* Nav Links */}
        <div className="flex gap-8 flex-1">
          {['transfers', 'history', 'settings'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={`font-sans text-base capitalize pb-1 transition-colors ${
                activeNav === item
                  ? 'text-rust-primary'
                  : 'text-ink-primary hover:text-ink-secondary'
              }`}
              style={{
                borderBottom:
                  activeNav === item ? '1.5px solid #b54a1a' : 'none',
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Logout and Workspace Badge */}
        <div className="flex-shrink-0 flex items-center gap-4">
          <div className="font-sans text-xs border border-border-primary bg-paper-1 px-2 py-1 text-ink-secondary">
            workspace / personal
          </div>
          <button
            onClick={onLogout}
            className="font-sans text-xs text-ink-muted hover:text-rust-primary transition-colors"
          >
            log out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Column */}
        <div className="flex-1 px-8 py-10 border-r border-border-primary">
          {activeNav === 'transfers' && (
            <>
              <div
                className={`border-2 border-dashed rounded-none p-12 text-center transition-all relative ${
                  dragActive
                    ? 'border-rust-primary bg-rust-light'
                    : 'border-border-primary bg-paper-2'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  borderStyle: 'dashed',
                  borderWidth: '1.5px',
                }}
              >
                <div className="absolute top-4 right-4 font-sans text-xs text-ink-muted">
                  max 5 GB
                </div>

                <h2 className="font-serif text-2xl font-bold text-ink-primary mb-2">
                  Drop files here
                </h2>

                <p className="font-sans text-sm text-ink-muted mb-6">
                  or browse from disk (any format accepted)
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="font-sans text-base bg-rust-primary text-white px-5 py-2 hover:bg-rust-dark transition-colors"
                >
                  select files
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="mt-10">
                <h3 className="section-label">Active transfers</h3>

                {visibleActiveTransfers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="font-sans text-sm text-ink-muted">No active transfers yet</p>
                  </div>
                ) : (
                  visibleActiveTransfers.map((file) => (
                    <div
                      key={file.id}
                      className={`card mb-3 ${
                        isExpired(file) ? 'opacity-55' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-sans text-lg font-medium text-ink-primary truncate">
                            {file.name}
                          </div>
                          <div className="font-sans text-xs text-ink-muted mt-1">
                            {file.size} uploaded {file.uploaded}
                          </div>
                        </div>
                        <div className={`badge border ml-4 flex-shrink-0 ${getBadgeStyles(file.status)}`}>
                          {file.status}
                        </div>
                      </div>

                      <div className="bg-border-primary mb-3 overflow-hidden">
                        <div
                          className="h-0.5 bg-rust-primary transition-all"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>

                      <div className="border-t border-border-secondary pt-2 flex items-center justify-between gap-4">
                        <a
                          href={getTransferUrl(file.slug)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            e.preventDefault()
                            openTransferUrl(file.slug)
                          }}
                          className="font-sans text-xs text-rust-primary truncate flex-1 hover:underline"
                        >
                          {getTransferUrl(file.slug)}
                        </a>
                        <button
                          onClick={() => handleCopy(file.id, file.name)}
                          className={`font-sans text-xs px-2 py-1 transition-all flex-shrink-0 ${
                            copyStates[file.id]
                              ? 'bg-sage-tint text-sage-primary border border-sage-primary'
                              : 'border border-ink-primary text-ink-primary hover:border-rust-primary hover:text-rust-primary'
                          }`}
                        >
                          {copyStates[file.id] ? 'copied' : 'copy'}
                        </button>
                        <button
                          onClick={() => handleDeleteTransfer(file.slug)}
                          className="font-sans text-xs px-2 py-1 border border-border-primary text-ink-muted hover:border-rust-primary hover:text-rust-primary transition-colors"
                        >
                          delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {visibleExpiredTransfers.length > 0 && (
                <div className="mt-10">
                  <h3 className="section-label">Recently expired</h3>

                  {visibleExpiredTransfers.map((file) => (
                    <div
                      key={file.id}
                      className="card mb-3 opacity-55"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-sans text-lg font-medium text-ink-primary truncate">
                            {file.name}
                          </div>
                          <div className="font-sans text-xs text-ink-muted mt-1">
                            {file.size} expired {file.uploaded}
                          </div>
                        </div>
                        <div className={`badge border ml-4 flex-shrink-0 ${getBadgeStyles('expired')}`}>
                          expired
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeNav === 'history' && (
            <div>
              <h2 className="font-serif text-3xl font-bold text-ink-primary mb-3">Transfer history</h2>
              <p className="font-sans text-sm text-ink-muted mb-8">
                These entries come from the database, so they persist after logout and login.
              </p>

              {remoteTransfers.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="font-sans text-sm text-ink-muted">No saved transfers yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {remoteTransfers.map(({ transfer, files: transferFiles }) => {
                    const totalSize = transferFiles.reduce((acc, file) => acc + Number(file.size_bytes || 0), 0)
                    return (
                      <div key={transfer.id} className="card">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="min-w-0">
                              <a
                                href={getTransferUrl(transfer.slug)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => {
                                  e.preventDefault()
                                  openTransferUrl(transfer.slug)
                                }}
                                className="font-sans text-lg font-medium text-ink-primary truncate hover:underline"
                              >
                                {getTransferUrl(transfer.slug)}
                              </a>
                            <div className="font-sans text-xs text-ink-muted mt-1">
                              Created {new Date(transfer.created_at).toLocaleString()} · Expires {new Date(transfer.expires_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className={`badge border flex-shrink-0 ${getBadgeStyles(transfer.status)}`}>
                            {transfer.status}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="stat-card">
                            <div className="font-sans text-2xl font-bold text-ink-primary">{transferFiles.length}</div>
                            <div className="font-sans text-xs uppercase text-ink-muted mt-1">Files</div>
                          </div>
                          <div className="stat-card">
                            <div className="font-sans text-2xl font-bold text-ink-primary">{(totalSize / 1024 / 1024).toFixed(2)}</div>
                            <div className="font-sans text-xs uppercase text-ink-muted mt-1">MB</div>
                          </div>
                          <div className="stat-card">
                            <div className="font-sans text-2xl font-bold text-ink-primary">{transfer.download_count || 0}</div>
                            <div className="font-sans text-xs uppercase text-ink-muted mt-1">Downloads</div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {transferFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between border border-border-secondary px-3 py-2">
                              <div className="min-w-0">
                                <div className="font-sans text-sm text-ink-primary truncate">{file.original_name}</div>
                                <div className="font-sans text-xs text-ink-muted">{(Number(file.size_bytes) / 1024 / 1024).toFixed(2)} MB</div>
                              </div>
                              <div className="font-sans text-xs text-ink-muted capitalize">
                                {file.scan_status || 'pending'}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center border-t border-border-secondary pt-3">
                          <span className="font-sans text-xs text-ink-muted">
                            Download limit: {transfer.download_limit ?? 'unlimited'}
                          </span>
                          <button
                            onClick={() => handleDeleteTransfer(transfer.slug)}
                            className="font-sans text-xs px-3 py-1 border border-ink-primary text-ink-primary hover:border-rust-primary hover:text-rust-primary transition-colors"
                          >
                            delete transfer
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeNav === 'settings' && (
            <div>
              <h2 className="font-serif text-3xl font-bold text-ink-primary mb-3">Transfer settings</h2>
              <p className="font-sans text-sm text-ink-muted mb-8">
                These defaults are saved locally and applied to new transfers.
              </p>

              <div className="card space-y-4">
                <div className="flex justify-between items-center gap-4 py-2.5 border-b border-border-secondary">
                  <label className="font-serif text-lg text-ink-secondary">Expiry</label>
                  <select
                    className="input-field text-sm"
                    value={expiryDays}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                  >
                    <option value={1}>1 day</option>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>

                <div className="flex justify-between items-center gap-4 py-2.5 border-b border-border-secondary">
                  <label className="font-serif text-lg text-ink-secondary">Download limit</label>
                  <select
                    className="input-field text-sm"
                    value={downloadLimit}
                    onChange={(e) => handleDownloadLimitChange(e.target.value)}
                  >
                    <option value="unlimited">unlimited</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="100">100</option>
                  </select>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-border-secondary">
                  <label className="font-serif text-lg text-ink-secondary">Password protect</label>
                  <div
                    className={`relative toggle-track ${toggleStates.passwordProtect ? 'active' : ''}`}
                    onClick={() => toggleSwitch('passwordProtect')}
                  >
                    <div className="toggle-thumb"></div>
                  </div>
                </div>

                {toggleStates.passwordProtect && (
                  <input
                    type="password"
                    placeholder="Transfer password"
                    value={transferPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="w-full input-field text-sm"
                  />
                )}

                <div className="flex justify-between items-center py-2.5 border-b border-border-secondary">
                  <label className="font-serif text-lg text-ink-secondary">Virus scan</label>
                  <div
                    className={`relative toggle-track ${toggleStates.virusScan ? 'active' : ''}`}
                    onClick={() => toggleSwitch('virusScan')}
                  >
                    <div className="toggle-thumb"></div>
                  </div>
                </div>

                <div className="flex flex-col py-2.5">
                  <div className="flex justify-between items-center">
                    <label className="font-serif text-lg text-ink-secondary">Notify on download</label>
                    <div
                      className={`relative toggle-track ${toggleStates.notifyOnDownload ? 'active' : ''}`}
                      onClick={() => toggleSwitch('notifyOnDownload')}
                    >
                      <div className="toggle-thumb"></div>
                    </div>
                  </div>
                  {toggleStates.notifyOnDownload && (
                    <input
                      type="email"
                      placeholder="Notification email"
                      value={userEmail}
                      onChange={(e) => handleNotificationEmailChange(e.target.value)}
                      className="mt-3 w-full input-field text-sm"
                    />
                  )}
                </div>

                <p className="font-sans text-xs text-ink-muted pt-2">
                  Settings save automatically in your browser and apply to the next upload.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-paper-2 px-6 py-8 overflow-y-auto">
          {/* This Week Stats */}
          <h3 className="section-label">this week</h3>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="stat-card">
              <div className="font-sans text-3xl font-bold text-ink-primary">
                {visibleActiveTransfers.length}
              </div>
              <div className="font-sans text-xs uppercase text-ink-muted mt-1">
                Transfers
              </div>
            </div>

            <div className="stat-card">
              <div className="font-sans text-3xl font-bold text-ink-primary">0</div>
              <div className="font-sans text-xs uppercase text-ink-muted mt-1">
                GB Sent
              </div>
            </div>

            <div className="stat-card">
              <div className="font-sans text-3xl font-bold text-ink-primary">
                {visibleActiveTransfers.reduce((acc, file) => acc + (file.downloadCount || file.downloads || 0), 0)}
              </div>
              <div className="font-sans text-xs uppercase text-ink-muted mt-1">
                Downloads
              </div>
            </div>

            <div className="stat-card">
              <div className="font-sans text-3xl font-bold text-ink-primary">
                {visibleExpiredTransfers.length}
              </div>
              <div className="font-sans text-xs uppercase text-ink-muted mt-1">
                Expiring Soon
              </div>
            </div>
          </div>

          {/* Transfer Defaults */}
          <h3 className="section-label">transfer defaults</h3>

          <div className="space-y-0 mb-8">
            <div className="flex justify-between items-center py-2.5 border-b border-border-secondary">
              <label className="font-serif text-lg text-ink-secondary">Expiry</label>
              <select
                className="input-field text-sm"
                value={expiryDays}
                onChange={(e) => handleExpiryChange(e.target.value)}
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-border-secondary">
              <label className="font-serif text-lg text-ink-secondary">Download limit</label>
              <select
                className="input-field text-sm"
                value={downloadLimit}
                onChange={(e) => handleDownloadLimitChange(e.target.value)}
              >
                <option value="unlimited">unlimited</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="100">100</option>
              </select>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-border-secondary">
              <label className="font-serif text-lg text-ink-secondary">Password protect</label>
              <div
                className={`relative toggle-track ${toggleStates.passwordProtect ? 'active' : ''}`}
                onClick={() => toggleSwitch('passwordProtect')}
              >
                <div className="toggle-thumb"></div>
              </div>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-border-secondary">
              <label className="font-serif text-lg text-ink-secondary">Virus scan</label>
              <div
                className={`relative toggle-track ${toggleStates.virusScan ? 'active' : ''}`}
                onClick={() => toggleSwitch('virusScan')}
              >
                <div className="toggle-thumb"></div>
              </div>
            </div>

            <div className="flex flex-col py-2.5">
              <div className="flex justify-between items-center">
                <label className="font-serif text-lg text-ink-secondary">Notify on download</label>
                <div
                  className={`relative toggle-track ${toggleStates.notifyOnDownload ? 'active' : ''}`}
                  onClick={() => toggleSwitch('notifyOnDownload')}
                >
                  <div className="toggle-thumb"></div>
                </div>
              </div>
              {toggleStates.notifyOnDownload && (
                <input
                  type="email"
                  placeholder="Notification email"
                  value={userEmail}
                  onChange={(e) => handleNotificationEmailChange(e.target.value)}
                  className="mt-3 w-full input-field text-xs"
                />
              )}
            </div>
          </div>

          {/* Background Workers */}
          <h3 className="section-label">background workers</h3>

          <div className="card">
            <div className="space-y-3">
              {(Array.isArray(Object.keys(workerStats || {})) && Object.keys(workerStats).length > 0
                ? Object.keys(workerStats).map((k) => ({ name: k, ...workerStats[k] }))
                : [
                    { name: 'upload-processor', status: 'running', uptime: '4h 12m' },
                    { name: 'av-scanner', status: 'running', uptime: '2h 05m' },
                    { name: 'thumbnail-gen', status: 'running', uptime: '1h 48m' },
                    { name: 'metadata-sync', status: 'idle', uptime: '3m ago' },
                    { name: 'email-notifier', status: 'paused', uptime: '' },
                  ]).map((worker, idx) => {
                const dotColor =
                  worker.status === 'running'
                    ? '#3a5c42'
                    : worker.status === 'idle'
                      ? '#c47a1a'
                      : '#d4c9b8'

                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="rounded-full flex-shrink-0"
                        style={{
                          width: '6px',
                          height: '6px',
                          backgroundColor: dotColor,
                        }}
                      ></div>
                      <span className="font-sans text-sm text-ink-secondary">
                        {worker.name}
                      </span>
                    </div>
                    <span className="font-sans text-xs text-ink-muted">
                      {worker.uptime}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border-primary bg-paper-1 px-8 py-2.5 flex items-center gap-6">
        <span className="font-sans text-xs text-ink-muted flex-shrink-0">cron jobs</span>
        <div className="flex gap-3">
          {['cleanup:expired', 'orphan-sweep', 'storage-audit'].map((cron) => (
            <span key={cron} className="cron-pill">
              {cron}
            </span>
          ))}
        </div>
        <span className="font-sans text-xs text-ink-secondary ml-auto">
          next run: 02:00 UTC (3h 47m)
        </span>
      </div>
    </div>
  )
}
