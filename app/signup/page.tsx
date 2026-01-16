'use client';

import Link from 'next/link';

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-surface-dark flex items-center justify-center">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]" />
      </div>
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl">📚</span>
              <span className="font-display font-bold text-xl text-gradient">ShelfieEase</span>
            </Link>
            <h1 className="text-white font-semibold text-2xl mb-2">Create account</h1>
            <p className="text-neutral-400 text-sm">Start building your digital bookshelf</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm text-neutral-400 mb-2">Name</label>
              <input 
                type="text" 
                id="name" 
                className="input-modern w-full" 
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-neutral-400 mb-2">Email</label>
              <input 
                type="email" 
                id="email" 
                className="input-modern w-full" 
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-neutral-400 mb-2">Password</label>
              <input 
                type="password" 
                id="password" 
                className="input-modern w-full" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <button className="w-full btn-gradient py-4 mb-4">
            Create account
          </button>

          <p className="text-center text-neutral-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-light hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Link href="/library" className="block text-center text-neutral-400 text-sm hover:text-white transition-colors">
              Continue without account →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}



