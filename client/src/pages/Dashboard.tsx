import { useState, useEffect, useRef } from 'react'

export default function Dashboard({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState('transfers')
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [copyStates, setCopyStates] = useState({})
  const [toggleStates, setToggleStates] = useState({
    passwordProtect: false,
    virusScan: true,
    notifyOnDownload: true,
  })
  const [userEmail, setUserEmail] = useState(user?.user?.email || '')
  const fileInputRef = useRef(null)
  const [workerStats, setWorkerStats] = useState([])
  const [serverTransfers, setServerTransfers] = useState([])

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles)
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      uploadFiles(e.target.files)
    }
  }

  const uploadFiles = async (fileList) => {
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
      body: JSON.stringify({ files: payloadFiles, expiryDays: 7, notify, email })
    })
    if (!res.ok) {
      console.error('create transfer failed')
      return
    }
    const data = await res.json()
    const { slug, presignedUrls, transferId } = data
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
      const p = presignedUrls.find(pu => pu.name === nf.name && pu.fileId === nf.fileId)
      if (!p) return
      await new Promise((resolve, reject) => {
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
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i]
  }

  const handleCopy = (fileId, filename) => {
    const f = files.find(x => x.id === fileId)
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
        const headers = ADMIN ? { Authorization: `Bearer ${ADMIN}` } : {}
        const w = await fetch('/api/admin/workers', { headers })
        if (w.ok) {
          const jw = await w.json()
          if (mounted) setWorkerStats(jw.queues || [])
        }
        const t = await fetch('/api/admin/transfers', { headers })
        if (t.ok) {
          const jt = await t.json()
          if (mounted) setServerTransfers(jt)
        }
      } catch (err) { console.error(err) }
    }
    fetchAdmin()
    const iv = setInterval(fetchAdmin, 10000)
    return () => { mounted = false; clearInterval(iv) }
  }, [])

  const toggleSwitch = (key) => {
    setToggleStates((prev) => ({ ...prev, [key]: !prev[key] }))
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

  const removeFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId))
  }

  const getBadgeStyles = (status) => {
    const styles = {
      ready: 'bg-sage-tint text-sage-primary border-sage-primary',
      processing: 'bg-amber-tint text-amber-primary border-amber-primary',
      uploading: 'bg-amber-tint text-amber-primary border-amber-primary',
      scanning: 'bg-rust-light text-rust-primary border-rust-primary',
      expired: 'bg-paper-2 text-ink-muted border-border-primary',
    }
    return styles[status] || ''
  }

  const activeTransfers = files.filter(f => f.status !== 'expired')
  const expiredTransfers = files.filter(f => f.status === 'expired')

  return (
    <div className="flex flex-col min-h-screen bg-paper-1">
      {/* Navigation Bar */}
      <nav className="h-52px border-b border-border-primary bg-paper-1 flex items-center px-8 gap-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <span
            onClick={() => setActiveNav('transfers')}
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
          {/* Upload Zone */}
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
            {/* Max size label */}
            <div className="absolute top-4 right-4 font-sans text-xs text-ink-muted">
              max 5 GB
            </div>

            {/* Heading */}
            <h2 className="font-serif text-2xl font-bold text-ink-primary mb-2">
              Drop files here
            </h2>

            {/* Subtext */}
            <p className="font-sans text-sm text-ink-muted mb-6">
              or browse from disk (any format accepted)
            </p>

            {/* Button */}
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

          {/* Active Transfers Section */}
          <div className="mt-10">
            <h3 className="section-label">Active transfers</h3>

            {activeTransfers.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-sans text-sm text-ink-muted">No active transfers yet</p>
              </div>
            ) : (
              activeTransfers.map((file) => (
                <div
                  key={file.id}
                  className={`card mb-3 ${
                    file.status === 'expired' ? 'opacity-55' : ''
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

                  {/* Progress Bar */}
                  <div className="bg-border-primary mb-3 overflow-hidden">
                    <div
                      className="h-0.5 bg-rust-primary transition-all"
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>

                  {/* Link Row */}
                  {file.status !== 'expired' && (
                    <div className="border-t border-border-secondary pt-2 flex items-center justify-between gap-4">
                      <span className="font-sans text-xs text-rust-primary truncate flex-1">
                        {window.location.origin}/d/{file.slug}
                      </span>
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
                        onClick={() => removeFile(file.id)}
                        className="font-sans text-xs px-2 py-1 border border-border-primary text-ink-muted hover:border-rust-primary hover:text-rust-primary transition-colors"
                      >
                        remove
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Recently Expired Section */}
          {expiredTransfers.length > 0 && (
            <div className="mt-10">
              <h3 className="section-label">Recently expired</h3>

              {expiredTransfers.map((file) => (
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
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-paper-2 px-6 py-8 overflow-y-auto">
          {/* This Week Stats */}
          <h3 className="section-label">this week</h3>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="stat-card">
              <div className="font-sans text-3xl font-bold text-ink-primary">
                {activeTransfers.length}
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
              <div className="font-sans text-3xl font-bold text-ink-primary">0</div>
              <div className="font-sans text-xs uppercase text-ink-muted mt-1">
                Downloads
              </div>
            </div>

            <div className="stat-card">
              <div className="font-sans text-3xl font-bold text-ink-primary">0</div>
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
              <select className="input-field text-sm">
                <option>7 days</option>
                <option>14 days</option>
                <option>30 days</option>
                <option>never</option>
              </select>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-border-secondary">
              <label className="font-serif text-lg text-ink-secondary">Download limit</label>
              <select className="input-field text-sm">
                <option>unlimited</option>
                <option>10</option>
                <option>25</option>
                <option>100</option>
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
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="mt-3 w-full bg-paper-1 border border-border-primary px-3 py-2 font-sans text-xs focus:outline-none focus:border-rust-primary"
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
