import { useState } from 'react'

export default function Landing({
  onNavigate,
  user,
  onLogout,
  setActiveNav
}: {
  onNavigate: (page: string) => void;
  user: any;
  onLogout: () => void;
  setActiveNav: (nav: string) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeMockTab, setActiveMockTab] = useState<'upload' | 'download'>('upload')
  const [mockExpiry, setMockExpiry] = useState('7')
  const [mockPassword, setMockPassword] = useState(false)
  const [mockNotify, setMockNotify] = useState(true)
  const [mockCopied, setMockCopied] = useState(false)
  const [mockUnlocked, setMockUnlocked] = useState(false)
  const [mockPasswordInput, setMockPasswordInput] = useState('')
  const [mockUnlockError, setMockUnlockError] = useState(false)

  // SVG Icon components
  const UploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V15M12 2L8 6M12 2L16 6M3 15V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const LockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
    </svg>
  )

  const ShareIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.75"/>
      <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="1.75"/>
      <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1.75"/>
      <path d="M8.5 11L15.5 8M8.5 13L15.5 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )

  const HistoryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75"/>
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const CheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12L9 17L20 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const AnalyticsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 20H21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <rect x="5" y="13" width="3" height="7" stroke="currentColor" strokeWidth="1.75"/>
      <rect x="10.5" y="9" width="3" height="11" stroke="currentColor" strokeWidth="1.75"/>
      <rect x="16" y="5" width="3" height="15" stroke="currentColor" strokeWidth="1.75"/>
    </svg>
  )

  const handleCopyDemo = () => {
    navigator.clipboard.writeText(`https://sendslot.com/d/sendslot-demo-slug`)
    setMockCopied(true)
    setTimeout(() => setMockCopied(false), 1500)
  }

  const handleMockUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (mockPasswordInput === 'password') {
      setMockUnlocked(true)
      setMockUnlockError(false)
    } else {
      setMockUnlockError(true)
    }
  }

  return (
    <div className="min-h-screen bg-paper-1 flex flex-col relative overflow-hidden select-none">
      {/* Decorative Blur Background circles */}
      <div className="absolute top-[-300px] left-[-200px] w-[600px] h-[600px] rounded-full bg-rust-light/40 blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[500px] right-[-300px] w-[600px] h-[600px] rounded-full bg-sage-tint/30 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-200px] left-[200px] w-[500px] h-[500px] rounded-full bg-amber-tint/40 blur-[110px] pointer-events-none z-0" />

      {/* Navigation (Glassmorphic & Sticky) */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-paper-1/75 border-b border-border-primary/40 px-8 py-4 flex items-center justify-between">
        <div
          onClick={() => onNavigate('landing')}
          className="text-xl font-sans font-medium tracking-tight cursor-pointer hover:text-rust-primary transition-all duration-300 flex items-center gap-2 group"
        >
          <span className="bg-rust-primary text-white w-7 h-7 flex items-center justify-center font-serif font-bold text-sm tracking-normal shadow-sm group-hover:rotate-6 transition-transform">S</span>
          <span>SendSlot<span className="text-rust-primary">.</span></span>
        </div>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-8 h-8 rounded-full bg-rust-primary text-white font-sans text-sm font-semibold flex items-center justify-center cursor-pointer hover:bg-rust-dark transition-all duration-200 border border-border-primary shadow-sm hover:shadow-md focus:outline-none"
            >
              {user.user?.email?.[0]?.toUpperCase() || 'U'}
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-paper-1 border border-border-primary shadow-2xl py-1.5 z-20 font-sans text-xs animate-fade-in">
                  <div className="px-4 py-2 border-b border-border-secondary text-ink-secondary truncate font-medium">
                    {user.user?.email}
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      setActiveNav('transfers')
                      onNavigate('dashboard')
                    }}
                    className="w-full text-left px-4 py-2.5 text-ink-primary hover:bg-paper-2 hover:text-rust-primary transition-all duration-150 cursor-pointer"
                  >
                    Transfers
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      setActiveNav('history')
                      onNavigate('dashboard')
                    }}
                    className="w-full text-left px-4 py-2.5 text-ink-primary hover:bg-paper-2 hover:text-rust-primary transition-all duration-150 cursor-pointer"
                  >
                    History
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      setActiveNav('settings')
                      onNavigate('dashboard')
                    }}
                    className="w-full text-left px-4 py-2.5 text-ink-primary hover:bg-paper-2 hover:text-rust-primary transition-all duration-150 cursor-pointer"
                  >
                    Settings
                  </button>
                  <div className="border-t border-border-secondary my-1"></div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      onLogout()
                    }}
                    className="w-full text-left px-4 py-2.5 text-rust-primary hover:bg-paper-2 hover:text-rust-dark font-medium transition-all duration-150 cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex gap-6 items-center">
            <button
              onClick={() => onNavigate('login')}
              className="font-sans text-base text-ink-primary hover:text-rust-primary transition-colors cursor-pointer"
            >
              log in
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="font-sans text-base bg-rust-primary text-white px-5 py-2 hover:bg-rust-dark shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-0"
            >
              get started
            </button>
          </div>
        )}
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-y-auto z-10 relative">
        
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-24">
          <div className="max-w-5xl w-full text-center flex flex-col items-center p-12">
            
            {/* Announcement Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-2 border border-rust-primary/30 bg-rust-light/35 px-4 py-1.5 rounded-full font-sans text-xs text-rust-primary shadow-sm hover:border-rust-primary/50 transition-colors animate-fade-in-down">
              <span className="w-1.5 h-1.5 rounded-full bg-rust-primary animate-pulse" />
              <span>Introducing SendSlot 2.0: Now with ClamAV virus scanning</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-ink-primary mb-6 leading-[1.1] max-w-4xl tracking-tight">
              Share large files with <span className="bg-gradient-to-r from-rust-primary via-rust-primary to-amber-primary bg-clip-text text-transparent">intent</span> and <span className="bg-gradient-to-r from-rust-primary via-rust-primary to-amber-primary bg-clip-text text-transparent">control</span>
            </h1>

            {/* Subheading */}
            <p className="font-sans text-sm md:text-base text-ink-secondary mb-10 max-w-2xl leading-relaxed">
              SendSlot brings the editorial sensibility of print design to file sharing. No advertising, no dark patterns. Just robust, beautiful, and secure delivery tunnels for your professional assets.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center mb-16">
              {user ? (
                <button
                  onClick={() => {
                    setActiveNav('transfers')
                    onNavigate('dashboard')
                  }}
                  className="font-sans text-base bg-rust-primary text-white px-8 py-3 hover:bg-rust-dark shadow-lg shadow-rust-primary/10 hover:shadow-xl hover:shadow-rust-primary/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('signup')}
                    className="font-sans text-base bg-rust-primary text-white px-8 py-3 hover:bg-rust-dark shadow-lg shadow-rust-primary/10 hover:shadow-xl hover:shadow-rust-primary/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0"
                  >
                    Start Sharing
                  </button>
                  <button
                    onClick={() => onNavigate('login')}
                    className="font-sans text-base border border-ink-primary text-ink-primary px-8 py-3 hover:border-rust-primary hover:text-rust-primary hover:bg-paper-2/55 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

            {/* Interactive Browser Mockup (Mind-Blowing Feature) */}
            <div className="w-full max-w-4xl border border-border-primary bg-paper-1 shadow-2xl overflow-hidden mt-6 text-left transform hover:scale-[1.01] transition-transform duration-300">
              
              {/* Browser Header Bar */}
              <div className="bg-paper-2 border-b border-border-primary px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                
                {/* Simulated URL bar */}
                <div className="bg-paper-1 border border-border-primary/50 text-[10px] text-ink-muted px-4 py-1 w-64 md:w-96 text-center select-all flex items-center justify-center gap-1.5 font-sans">
                  <svg className="w-3 h-3 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <span>sendslot.com{activeMockTab === 'upload' ? '/dashboard' : `/d/sendslot-demo-slug`}</span>
                </div>

                {/* Mock Switch tabs */}
                <div className="flex bg-paper-3/45 p-0.5 border border-border-primary">
                  <button
                    onClick={() => setActiveMockTab('upload')}
                    className={`font-sans text-[10px] px-2.5 py-1 transition-colors cursor-pointer border-0 ${activeMockTab === 'upload' ? 'bg-paper-1 text-ink-primary font-medium' : 'text-ink-muted hover:text-ink-primary'}`}
                  >
                    Upload Panel
                  </button>
                  <button
                    onClick={() => {
                      setActiveMockTab('download')
                      setMockUnlocked(false)
                    }}
                    className={`font-sans text-[10px] px-2.5 py-1 transition-colors cursor-pointer border-0 ${activeMockTab === 'download' ? 'bg-paper-1 text-ink-primary font-medium' : 'text-ink-muted hover:text-ink-primary'}`}
                  >
                    Download Portal
                  </button>
                </div>
              </div>

              {/* Mock Viewport Content */}
              <div className="p-6 md:p-8 bg-paper-1 min-h-[300px] flex flex-col justify-between">
                {activeMockTab === 'upload' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                    
                    {/* Left 2 columns: Upload List */}
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="section-label mt-0">Active transfers (demo)</h3>
                      
                      {/* File Card 1 */}
                      <div className="border border-border-secondary bg-paper-2/40 p-4 relative group">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-sans text-sm font-medium text-ink-primary">brand-assets-v3.zip</div>
                            <div className="font-sans text-[10px] text-ink-muted mt-0.5">42.5 MB • Just now</div>
                          </div>
                          <span className="badge border bg-sage-tint text-sage-primary border-sage-primary">Ready</span>
                        </div>
                        <div className="w-full bg-border-primary h-0.5 overflow-hidden">
                          <div className="w-full bg-sage-primary h-full" />
                        </div>
                      </div>

                      {/* File Card 2 */}
                      <div className="border border-border-secondary bg-paper-2/40 p-4 relative">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-sans text-sm font-medium text-ink-primary">cinematic-concept.mov</div>
                            <div className="font-sans text-[10px] text-ink-muted mt-0.5">182.1 MB • Uploading</div>
                          </div>
                          <span className="badge border bg-amber-tint text-amber-primary border-amber-primary">68%</span>
                        </div>
                        <div className="w-full bg-border-primary h-0.5 overflow-hidden">
                          <div className="w-[68%] bg-amber-primary h-full animate-pulse" />
                        </div>
                      </div>

                      {/* Link share copy element */}
                      <div className="border border-dashed border-border-primary p-3 bg-paper-2/25 flex items-center justify-between gap-4 mt-6">
                        <span className="font-sans text-[10px] text-rust-primary truncate">https://sendslot.com/d/sendslot-demo-slug</span>
                        <button
                          onClick={handleCopyDemo}
                          className={`font-sans text-[10px] px-3 py-1 border transition-all cursor-pointer ${mockCopied ? 'bg-sage-tint text-sage-primary border-sage-primary' : 'bg-transparent border-ink-primary text-ink-primary hover:border-rust-primary hover:text-rust-primary'}`}
                        >
                          {mockCopied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Right column: Interactive Settings Dashboard */}
                    <div className="border-l-0 md:border-l border-border-primary/60 pl-0 md:pl-6 space-y-5">
                      <h3 className="section-label mt-0">Configure settings</h3>
                      
                      {/* Expiry Selector */}
                      <div>
                        <label className="block font-serif text-xs text-ink-secondary mb-1.5">Expiry duration</label>
                        <select
                          value={mockExpiry}
                          onChange={(e) => setMockExpiry(e.target.value)}
                          className="w-full font-sans text-[11px] bg-paper-2 border border-border-primary px-2.5 py-1.5 text-ink-primary focus:outline-none"
                        >
                          <option value="1">1 Day</option>
                          <option value="7">7 Days</option>
                          <option value="30">30 Days</option>
                        </select>
                      </div>

                      {/* Password Protect Toggle */}
                      <div className="flex justify-between items-center py-1">
                        <div>
                          <label className="block font-serif text-xs text-ink-secondary">Password protect</label>
                          <span className="font-sans text-[9px] text-ink-muted">Requires unlock code</span>
                        </div>
                        <div
                          onClick={() => setMockPassword(!mockPassword)}
                          className={`relative border border-border-primary rounded-lg transition-colors cursor-pointer w-6 h-3.5 ${mockPassword ? 'bg-sage-primary border-sage-primary' : 'bg-transparent'}`}
                        >
                          <div className={`absolute bg-white rounded-full transition-all w-2 h-2 top-[3px] ${mockPassword ? 'left-[13px]' : 'left-[3px]'}`} />
                        </div>
                      </div>

                      {/* Notification Toggle */}
                      <div className="flex justify-between items-center py-1">
                        <div>
                          <label className="block font-serif text-xs text-ink-secondary">Email notification</label>
                          <span className="font-sans text-[9px] text-ink-muted">Notify on download</span>
                        </div>
                        <div
                          onClick={() => setMockNotify(!mockNotify)}
                          className={`relative border border-border-primary rounded-lg transition-colors cursor-pointer w-6 h-3.5 ${mockNotify ? 'bg-sage-primary border-sage-primary' : 'bg-transparent'}`}
                        >
                          <div className={`absolute bg-white rounded-full transition-all w-2 h-2 top-[3px] ${mockNotify ? 'left-[13px]' : 'left-[3px]'}`} />
                        </div>
                      </div>

                      {/* Interactive Help Hint */}
                      <div className="bg-rust-light/20 border border-rust-primary/20 p-2.5">
                        <p className="font-sans text-[10px] text-rust-primary leading-normal">
                          💡 <strong>Interactive Demo:</strong> Toggle the settings, then click "Download Portal" tab in the browser bar above to see the changes!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Download portal view */
                  <div className="flex-1 flex flex-col items-center justify-center py-4">
                    {mockPassword && !mockUnlocked ? (
                      /* Unlock Screen Mock */
                      <div className="max-w-sm w-full border border-border-primary bg-paper-2/45 p-6 text-center shadow-lg">
                        <div className="text-rust-primary mx-auto mb-3 flex justify-center">
                          <LockIcon />
                        </div>
                        <h4 className="font-serif text-base font-bold text-ink-primary mb-1.5">Password protected transfer</h4>
                        <p className="font-sans text-[10px] text-ink-muted mb-4 leading-normal">
                          Please enter the credentials to unlock the files. (Hint: enter <code className="bg-paper-3 px-1 text-ink-primary font-mono text-[9px]">password</code>)
                        </p>
                        
                        <form onSubmit={handleMockUnlock} className="space-y-3">
                          <input
                            type="password"
                            placeholder="Enter password"
                            value={mockPasswordInput}
                            onChange={(e) => setMockPasswordInput(e.target.value)}
                            className="w-full bg-paper-1 border border-border-primary px-3 py-1.5 font-sans text-xs focus:outline-none focus:border-rust-primary text-center"
                          />
                          {mockUnlockError && (
                            <div className="text-rust-primary font-sans text-[9px] text-center">Invalid password, try "password"</div>
                          )}
                          <button
                            type="submit"
                            className="w-full bg-rust-primary text-white py-1.5 font-sans text-xs hover:bg-rust-dark border-0 cursor-pointer shadow-sm"
                          >
                            Unlock Files
                          </button>
                        </form>
                      </div>
                    ) : (
                      /* File download direct portal */
                      <div className="max-w-xl w-full">
                        <div className="mb-6 flex justify-between items-end border-b border-border-primary pb-3">
                          <div>
                            <h4 className="font-serif text-lg font-bold text-ink-primary">Ready for download</h4>
                            <p className="font-sans text-[10px] text-ink-secondary mt-0.5">Shared via SendSlot. Expires in {mockExpiry} days.</p>
                          </div>
                          <span className="font-sans text-[9px] bg-sage-tint text-sage-primary px-2 py-0.5 border border-sage-primary font-medium">Safe Check Passed</span>
                        </div>

                        <div className="space-y-3 mb-6">
                          {/* File Item 1 */}
                          <div className="border border-border-secondary bg-paper-2/30 p-3.5 flex items-center justify-between">
                            <div>
                              <div className="font-sans text-xs font-semibold text-ink-primary">brand-assets-v3.zip</div>
                              <div className="font-sans text-[9px] text-ink-muted mt-0.5">42.5 MB • ZIP Archive</div>
                            </div>
                            <button
                              onClick={() => alert("Mock file download: in a real transfer, this retrieves a signed AWS S3 download link.")}
                              className="bg-rust-primary text-white px-3.5 py-1.5 font-sans text-[10px] hover:bg-rust-dark transition-colors border-0 cursor-pointer shadow-sm"
                            >
                              Download
                            </button>
                          </div>

                          {/* File Item 2 */}
                          <div className="border border-border-secondary bg-paper-2/30 p-3.5 flex items-center justify-between">
                            <div>
                              <div className="font-sans text-xs font-semibold text-ink-primary">cinematic-concept.mov</div>
                              <div className="font-sans text-[9px] text-ink-muted mt-0.5">182.1 MB • QuickTime Video</div>
                            </div>
                            <button
                              onClick={() => alert("Mock file download: in a real transfer, this retrieves a signed AWS S3 download link.")}
                              className="bg-rust-primary text-white px-3.5 py-1.5 font-sans text-[10px] hover:bg-rust-dark transition-colors border-0 cursor-pointer shadow-sm"
                            >
                              Download
                            </button>
                          </div>
                        </div>

                        <div className="text-center font-sans text-[9px] text-ink-muted pt-3 border-t border-border-secondary">
                          Total Transfer Size: 224.6 MB • 2 Files
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>

        {/* Feature Grid Section (Visual cards, lighting borders, group hovers) */}
        <div className="w-full bg-paper-2/65 border-y border-border-primary/50 py-24 px-6 relative">
          <div className="max-w-6xl mx-auto">
            
            <div className="mb-20 text-center flex flex-col items-center">
              <span className="font-sans text-xs uppercase tracking-widest text-rust-primary font-bold mb-2">Designed for Professionals</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink-primary max-w-xl">
                Everything you need to share files with complete control
              </h2>
              <div className="w-12 h-0.5 bg-rust-primary mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Box 1 */}
              <div className="group border border-border-primary bg-paper-1 p-8 hover:border-rust-primary/80 hover:-translate-y-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-2xl hover:shadow-rust-primary/5 transition-all duration-300 flex flex-col items-start text-left">
                <div className="mb-6 text-rust-primary bg-rust-light/65 p-3 group-hover:bg-rust-primary group-hover:text-white transition-colors duration-300 rounded-sm">
                  <UploadIcon />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-3 group-hover:text-rust-primary transition-colors">
                  Fast & Resumable
                </h3>
                <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                  Support for file uploads up to 5GB with AWS S3 Multi-part API, allowing recovery from network drops effortlessly.
                </p>
              </div>

              {/* Box 2 */}
              <div className="group border border-border-primary bg-paper-1 p-8 hover:border-rust-primary/80 hover:-translate-y-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-2xl hover:shadow-rust-primary/5 transition-all duration-300 flex flex-col items-start text-left">
                <div className="mb-6 text-rust-primary bg-rust-light/65 p-3 group-hover:bg-rust-primary group-hover:text-white transition-colors duration-300 rounded-sm">
                  <LockIcon />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-3 group-hover:text-rust-primary transition-colors">
                  Cryptographic Shield
                </h3>
                <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                  Every download url is presigned, time-restricted, and can be shielded with bcrypt hashed keys and ClamAV scanners.
                </p>
              </div>

              {/* Box 3 */}
              <div className="group border border-border-primary bg-paper-1 p-8 hover:border-rust-primary/80 hover:-translate-y-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-2xl hover:shadow-rust-primary/5 transition-all duration-300 flex flex-col items-start text-left">
                <div className="mb-6 text-rust-primary bg-rust-light/65 p-3 group-hover:bg-rust-primary group-hover:text-white transition-colors duration-300 rounded-sm">
                  <ShareIcon />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-3 group-hover:text-rust-primary transition-colors">
                  Granular Controls
                </h3>
                <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                  Establish parameters per transfer: restrict access by custom download limits, rate limits, and custom expirations.
                </p>
              </div>

              {/* Box 4 */}
              <div className="group border border-border-primary bg-paper-1 p-8 hover:border-rust-primary/80 hover:-translate-y-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-2xl hover:shadow-rust-primary/5 transition-all duration-300 flex flex-col items-start text-left">
                <div className="mb-6 text-rust-primary bg-rust-light/65 p-3 group-hover:bg-rust-primary group-hover:text-white transition-colors duration-300 rounded-sm">
                  <HistoryIcon />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-3 group-hover:text-rust-primary transition-colors">
                  Permanent Register
                </h3>
                <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                  A bulletproof audit register powered by PostgreSQL log events lets you see download counts, times, and hashes.
                </p>
              </div>

              {/* Box 5 */}
              <div className="group border border-border-primary bg-paper-1 p-8 hover:border-rust-primary/80 hover:-translate-y-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-2xl hover:shadow-rust-primary/5 transition-all duration-300 flex flex-col items-start text-left">
                <div className="mb-6 text-rust-primary bg-rust-light/65 p-3 group-hover:bg-rust-primary group-hover:text-white transition-colors duration-300 rounded-sm">
                  <CheckIcon />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-3 group-hover:text-rust-primary transition-colors">
                  Delivery Triggers
                </h3>
                <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                  Configured BullMQ workers execute background actions like email notifications on successful recipient download.
                </p>
              </div>

              {/* Box 6 */}
              <div className="group border border-border-primary bg-paper-1 p-8 hover:border-rust-primary/80 hover:-translate-y-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-2xl hover:shadow-rust-primary/5 transition-all duration-300 flex flex-col items-start text-left">
                <div className="mb-6 text-rust-primary bg-rust-light/65 p-3 group-hover:bg-rust-primary group-hover:text-white transition-colors duration-300 rounded-sm">
                  <AnalyticsIcon />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-3 group-hover:text-rust-primary transition-colors">
                  Task Diagnostics
                </h3>
                <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                  Real-time insight monitor powered by Redis statistics shows background jobs status, delays, and worker loads.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Specifications Statistics Counter */}
        <div className="w-full py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center p-6 border border-border-primary/45 bg-paper-2/30 hover:border-rust-primary/40 transition-colors">
                <div className="font-serif text-4xl md:text-5xl font-bold text-rust-primary mb-2">5 GB</div>
                <div className="font-sans text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Max File size limit</div>
              </div>
              <div className="text-center p-6 border border-border-primary/45 bg-paper-2/30 hover:border-rust-primary/40 transition-colors">
                <div className="font-serif text-4xl md:text-5xl font-bold text-rust-primary mb-2">Instant</div>
                <div className="font-sans text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Delivery tunnels</div>
              </div>
              <div className="text-center p-6 border border-border-primary/45 bg-paper-2/30 hover:border-rust-primary/40 transition-colors">
                <div className="font-serif text-4xl md:text-5xl font-bold text-rust-primary mb-2">Zero</div>
                <div className="font-sans text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Ad-banners or trackers</div>
              </div>
              <div className="text-center p-6 border border-border-primary/45 bg-paper-2/30 hover:border-rust-primary/40 transition-colors">
                <div className="font-serif text-4xl md:text-5xl font-bold text-rust-primary mb-2">AES-256</div>
                <div className="font-sans text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Object Storage encryption</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Workflow "How it Works" section */}
        <div className="w-full bg-paper-2/40 border-t border-border-primary/50 py-24 px-6">
          <div className="max-w-5xl mx-auto">
            
            <div className="mb-20 text-center flex flex-col items-center">
              <span className="font-sans text-xs uppercase tracking-widest text-rust-primary font-bold mb-2">Simple Workflow</span>
              <h2 className="font-serif text-3xl font-bold text-ink-primary">
                How SendSlot works
              </h2>
              <div className="w-12 h-0.5 bg-rust-primary mt-4" />
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center relative">
                <div className="w-12 h-12 rounded-full border-2 border-rust-primary text-rust-primary font-serif font-bold text-lg flex items-center justify-center mb-6 bg-paper-1 shadow-sm">1</div>
                <h3 className="font-serif text-lg font-bold text-ink-primary mb-2">Drop your payload</h3>
                <p className="font-sans text-xs text-ink-secondary max-w-xs leading-relaxed">
                  Drag and drop files in the dashboard. The application initiates AWS S3 uploads immediately with real-time feedback.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center relative">
                <div className="w-12 h-12 rounded-full border-2 border-rust-primary text-rust-primary font-serif font-bold text-lg flex items-center justify-center mb-6 bg-paper-1 shadow-sm">2</div>
                <h3 className="font-serif text-lg font-bold text-ink-primary mb-2">Configure parameters</h3>
                <p className="font-sans text-xs text-ink-secondary max-w-xs leading-relaxed">
                  Add optional password protection, custom expiry dates, and download notification parameters to control the lifecycle of the link.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center relative">
                <div className="w-12 h-12 rounded-full border-2 border-rust-primary text-rust-primary font-serif font-bold text-lg flex items-center justify-center mb-6 bg-paper-1 shadow-sm">3</div>
                <h3 className="font-serif text-lg font-bold text-ink-primary mb-2">Share secure links</h3>
                <p className="font-sans text-xs text-ink-secondary max-w-xs leading-relaxed">
                  Generate a clean, advertisement-free `/d/` page for your recipients. They download directly from S3 without authentication.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="w-full py-28 px-6 bg-gradient-to-br from-paper-1 to-paper-2 border-t border-border-primary/50 relative">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink-primary mb-6 leading-tight max-w-xl">
              Ready to experience file sharing with intention?
            </h2>
            <p className="font-sans text-sm text-ink-secondary mb-10 max-w-lg leading-relaxed">
              Create an account now and start sending large files immediately. No contracts, no credit card required.
            </p>
            {user ? (
              <button
                onClick={() => {
                  setActiveNav('transfers')
                  onNavigate('dashboard')
                }}
                className="font-sans text-base bg-rust-primary text-white px-8 py-3.5 hover:bg-rust-dark shadow-lg shadow-rust-primary/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 inline-block cursor-pointer border-0"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => onNavigate('signup')}
                className="font-sans text-base bg-rust-primary text-white px-8 py-3.5 hover:bg-rust-dark shadow-lg shadow-rust-primary/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 inline-block cursor-pointer border-0"
              >
                Create an Account
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border-primary/40 px-8 py-10 bg-paper-1 text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 font-sans text-xs font-semibold text-ink-secondary">
            <span className="bg-rust-primary text-white w-5 h-5 flex items-center justify-center font-serif font-bold text-[10px] tracking-normal">S</span>
            <span>SendSlot</span>
          </div>
          <p className="font-sans text-[10px] text-ink-muted max-w-md leading-relaxed">
            SendSlot is a privacy-first utility built for professionals. Transfers are subjected to rate-limits and scanned by ClamAV for virus containment.
          </p>
          <div className="flex gap-4 font-sans text-[10px] text-ink-secondary mt-2">
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-rust-primary transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-rust-primary transition-colors">Privacy Policy</a>
          </div>
        </footer>

      </div>
    </div>
  )
}
