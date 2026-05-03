export default function Landing({ onNavigate }) {
  // SVG Icon components (no emoji, pure design)
  const UploadIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4V20M16 4L11 9M16 4L21 9M4 20V24C4 25.1046 4.89543 26 6 26H26C27.1046 26 28 25.1046 28 24V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const LockIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 14H25V26C25 27.1046 24.1046 28 23 28H9C7.89543 28 7 27.1046 7 26V14ZM11 14V9C11 6.23858 13.2386 4 16 4C18.7614 4 21 6.23858 21 9V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="16" cy="19" r="1.5" fill="currentColor"/>
    </svg>
  )

  const ShareIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="24" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="24" cy="23" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10.5 14.5L21.5 10.5M10.5 17.5L21.5 21.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )

  const HistoryIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 9V16L21 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 8C4.5 9.5 4 10.5 4 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )

  const CheckIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16L12 24L28 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const AnalyticsIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 26H28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="7" y="18" width="3" height="8" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="12" width="3" height="14" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="21" y="6" width="3" height="20" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )

  return (
    <div className="min-h-screen bg-paper-1 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border-primary px-8 py-4 flex items-center justify-between">
        <div className="text-xl font-sans font-medium tracking-tight">
          SendSlot<span className="text-rust-primary">.</span>
        </div>
        <div className="flex gap-6">
          <button
            onClick={() => onNavigate('login')}
            className="font-sans text-base text-ink-primary hover:text-rust-primary transition-colors"
          >
            log in
          </button>
          <button
            onClick={() => onNavigate('signup')}
            className="font-sans text-base bg-rust-primary text-white px-6 py-2 hover:bg-rust-dark transition-colors"
          >
            get started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col overflow-y-auto max-h-[calc(100vh-52px)]">
        <div className="min-h-screen flex flex-col items-center justify-center px-8 py-20">
          <div className="max-w-4xl w-full">
            {/* Main Heading */}
            <h1 className="font-serif text-6xl font-bold text-ink-primary mb-6 leading-tight text-center">
              Share files with clarity and intent
            </h1>

            {/* Subheading */}
            <p className="font-sans text-lg text-ink-secondary mb-12 leading-relaxed text-center">
              SendSlot brings the editorial sensibility of print to file sharing. No clutter, no chaos. Just purpose-built tools for moving files between people with complete control.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-6 justify-center mb-24">
              <button
                onClick={() => onNavigate('signup')}
                className="font-sans text-base bg-rust-primary text-white px-8 py-3 hover:bg-rust-dark transition-colors"
              >
                start sharing
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="font-sans text-base border border-ink-primary text-ink-primary px-8 py-3 hover:border-rust-primary hover:text-rust-primary transition-colors"
              >
                sign in
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid - 6 boxes */}
        <div className="w-full bg-paper-2 py-20 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="font-serif text-3xl font-bold text-ink-primary mb-3">
                Everything you need to share with control
              </h2>
              <p className="font-sans text-sm text-ink-muted">
                Built for professionals who value clarity and intention
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Box 1 */}
              <div className="border border-border-primary bg-paper-1 p-6 hover:border-rust-primary transition-colors">
                <div className="mb-4 text-rust-primary">
                  <UploadIcon />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-2">
                  Fast uploads
                </h3>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  Transfer files up to 100GB with intelligent chunking and resume support for reliability.
                </p>
              </div>

              {/* Box 2 */}
              <div className="border border-border-primary bg-paper-1 p-6 hover:border-rust-primary transition-colors">
                <div className="mb-4 text-rust-primary">
                  <LockIcon />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-2">
                  Secure by default
                </h3>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  End-to-end encryption, password protection, and virus scanning on every transfer.
                </p>
              </div>

              {/* Box 3 */}
              <div className="border border-border-primary bg-paper-1 p-6 hover:border-rust-primary transition-colors">
                <div className="mb-4 text-rust-primary">
                  <ShareIcon />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-2">
                  Share with control
                </h3>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  Set expiry dates, download limits, and custom permissions for each transfer.
                </p>
              </div>

              {/* Box 4 */}
              <div className="border border-border-primary bg-paper-1 p-6 hover:border-rust-primary transition-colors">
                <div className="mb-4 text-rust-primary">
                  <HistoryIcon />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-2">
                  Complete history
                </h3>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  Full audit trail of every transfer. Know exactly what was shared and when.
                </p>
              </div>

              {/* Box 5 */}
              <div className="border border-border-primary bg-paper-1 p-6 hover:border-rust-primary transition-colors">
                <div className="mb-4 text-rust-primary">
                  <CheckIcon />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-2">
                  Verified transfers
                </h3>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  Confirmation notifications, checksums, and delivery tracking for peace of mind.
                </p>
              </div>

              {/* Box 6 */}
              <div className="border border-border-primary bg-paper-1 p-6 hover:border-rust-primary transition-colors">
                <div className="mb-4 text-rust-primary">
                  <AnalyticsIcon />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-2">
                  Analytics dashboard
                </h3>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  Detailed insights into transfers, bandwidth usage, and engagement metrics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="w-full py-20 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="font-serif text-3xl font-bold text-ink-primary mb-3">
                Built for scale and simplicity
              </h2>
              <p className="font-sans text-sm text-ink-muted">
                Designed with both individuals and teams in mind
              </p>
            </div>

            <div className="grid grid-cols-4 gap-8">
              <div className="text-center">
                <div className="font-sans text-4xl font-bold text-rust-primary mb-2">
                  100GB
                </div>
                <p className="font-sans text-sm text-ink-muted">
                  Max file size per transfer
                </p>
              </div>

              <div className="text-center">
                <div className="font-sans text-4xl font-bold text-rust-primary mb-2">
                  Unlimited
                </div>
                <p className="font-sans text-sm text-ink-muted">
                  Files and transfers
                </p>
              </div>

              <div className="text-center">
                <div className="font-sans text-4xl font-bold text-rust-primary mb-2">
                  30 days
                </div>
                <p className="font-sans text-sm text-ink-muted">
                  Default retention period
                </p>
              </div>

              <div className="text-center">
                <div className="font-sans text-4xl font-bold text-rust-primary mb-2">
                  Instant
                </div>
                <p className="font-sans text-sm text-ink-muted">
                  Activation and no credit card
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="w-full bg-paper-2 py-20 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="font-serif text-3xl font-bold text-ink-primary mb-3">
                Perfect for any workflow
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="border-l-2 border-rust-primary pl-6">
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-2">
                  Creative teams
                </h3>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  Share large design files, video assets, and mockups with clients and collaborators. Maintain version control and access logs.
                </p>
              </div>

              <div className="border-l-2 border-rust-primary pl-6">
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-2">
                  Legal professionals
                </h3>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  Securely transfer confidential documents with audit trails and compliance features. Perfect for GDPR and HIPAA requirements.
                </p>
              </div>

              <div className="border-l-2 border-rust-primary pl-6">
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-2">
                  Enterprise teams
                </h3>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  Centralized file sharing with workspace controls, team analytics, and organization-wide policies.
                </p>
              </div>

              <div className="border-l-2 border-rust-primary pl-6">
                <h3 className="font-serif text-xl font-bold text-ink-primary mb-2">
                  Independent creators
                </h3>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  Simple, professional way to deliver work to clients without complex setups or recurring fees.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="w-full py-20 px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold text-ink-primary mb-4">
              Ready to share with intention
            </h2>
            <p className="font-sans text-base text-ink-secondary mb-8 leading-relaxed">
              Join thousands of professionals who trust SendSlot for secure, controlled file sharing. No credit card required. Start with 5 free transfers today.
            </p>
            <button
              onClick={() => onNavigate('signup')}
              className="font-sans text-base bg-rust-primary text-white px-8 py-3 hover:bg-rust-dark transition-colors inline-block"
            >
              create an account
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border-primary px-8 py-6 text-center bg-paper-1">
        <p className="font-sans text-xs text-ink-muted">
          SendSlot is built for professionals. By using our service, you agree to our Terms of Service and Privacy Policy.
        </p>
      </footer>
    </div>
  )
}
