"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Github, Mail, Lock, X } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  callbackUrl?: string
}

export default function LoginModal({
  isOpen,
  onClose,
  title = "Sign in to continue",
  message = "You need to be signed in to access this feature.",
  callbackUrl
}: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'oauth' | 'credentials'>('oauth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  // Use provided callback URL or default to current page
  const redirectUrl = callbackUrl || window.location.pathname + window.location.search

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    try {
      await signIn(provider, {
        callbackUrl: redirectUrl,
        redirect: true
      })
    } catch (error) {
      console.error('OAuth sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: redirectUrl,
        redirect: false
      })

      if (result?.error) {
        alert('Invalid credentials. Please try again.')
      } else {
        onClose()
        // Redirect to the callback URL after successful login
        window.location.href = redirectUrl
      }
    } catch (error) {
      console.error('Credentials sign in error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Modal Container - No backdrop needed as modal-context handles it */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-8 pr-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 text-base leading-relaxed">{message}</p>
        </div>

        {/* Auth method toggle */}
        <div className="flex mb-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1.5 border border-gray-200">
          <button
            onClick={() => setLoginMethod('oauth')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${loginMethod === 'oauth'
              ? 'bg-white text-blue-600 shadow-md shadow-blue-100 scale-[1.02]'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Social Login
          </button>
          <button
            onClick={() => setLoginMethod('credentials')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${loginMethod === 'credentials'
              ? 'bg-white text-blue-600 shadow-md shadow-blue-100 scale-[1.02]'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Email & Password
          </button>
        </div>

        {/* OAuth Login */}
        {loginMethod === 'oauth' && (
          <div className="space-y-4">
            <Button
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-6 text-base font-semibold border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-gray-700">Continue with Google</span>
            </Button>

            <Button
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-6 text-base font-semibold border-2 border-gray-200 hover:border-gray-800 hover:bg-gray-50 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github size={22} className="text-gray-800" />
              <span className="text-gray-700">Continue with GitHub</span>
            </Button>
          </div>
        )}

        {/* Credentials Login */}
        {loginMethod === 'credentials' && (
          <form onSubmit={handleCredentialsSignIn} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-6 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-6 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">New to our platform?</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-base text-gray-600">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => alert('Registration feature coming soon!')}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200"
            >
              Sign up for free
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}