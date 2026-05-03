import { useState } from 'react'

export default function Login({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email && password) {
      onLogin()
    }
  }

  return (
    <div className="min-h-screen bg-paper-1 flex">
      {/* Left side with branding */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-12 border-r border-border-primary">
        <div
          onClick={() => onNavigate('landing')}
          className="text-xl font-sans font-medium tracking-tight cursor-pointer hover:text-rust-primary transition-colors"
        >
          SendSlot<span className="text-rust-primary">.</span>
        </div>

        <div>
          <h2 className="font-serif text-4xl font-bold text-ink-primary mb-4 leading-tight">
            Welcome back
          </h2>
          <p className="font-sans text-lg text-ink-secondary">
            Sign in to your account and continue sharing with intention.
          </p>
        </div>

        <p className="font-sans text-xs text-ink-muted">
          The editorial approach to file sharing.
        </p>
      </div>

      {/* Right side with form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="md:hidden mb-8">
            <div
              onClick={() => onNavigate('landing')}
              className="text-xl font-sans font-medium tracking-tight cursor-pointer hover:text-rust-primary transition-colors mb-8"
            >
              SendSlot<span className="text-rust-primary">.</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-ink-primary mb-2">
              Welcome back
            </h2>
            <p className="font-sans text-sm text-ink-secondary">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-serif text-lg text-ink-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full font-sans text-base bg-paper-1 border border-border-primary px-4 py-3 text-ink-primary placeholder-ink-muted focus:outline-none focus:border-rust-primary"
              />
            </div>

            <div>
              <label className="block font-serif text-lg text-ink-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full font-sans text-base bg-paper-1 border border-border-primary px-4 py-3 text-ink-primary placeholder-ink-muted focus:outline-none focus:border-rust-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full font-sans text-base bg-rust-primary text-white py-3 hover:bg-rust-dark transition-colors"
            >
              sign in
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-8 text-center border-t border-border-primary pt-8">
            <p className="font-sans text-sm text-ink-muted mb-2">
              No account yet?
            </p>
            <button
              onClick={() => onNavigate('signup')}
              className="font-sans text-base text-rust-primary hover:text-rust-dark transition-colors"
            >
              create one
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
