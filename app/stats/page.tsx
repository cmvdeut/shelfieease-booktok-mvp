'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StatsPage() {
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    const savedBooks = JSON.parse(localStorage.getItem('shelfie-books') || '[]');
    setBooks(savedBooks);
  }, []);

  const readingCount = books.filter(b => b.status === 'reading').length;
  const tbrCount = books.filter(b => b.status === 'tbr').length;
  const finishedCount = books.filter(b => b.status === 'finished').length;
  const totalBooks = books.length;

  return (
    <main className="min-h-screen bg-surface-dark">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]" />
      </div>
      <div className="relative z-10">
        <header className="sticky top-0 z-20 bg-surface-dark/80 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/library" className="flex items-center gap-2 text-neutral-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
              <h1 className="font-display font-bold text-lg text-white">Reading Stats</h1>
              <div className="w-16" />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {totalBooks === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-white font-semibold text-xl mb-2">No stats yet</h3>
              <p className="text-neutral-400 mb-6">Start adding books to see your reading statistics!</p>
              <Link href="/scan" className="btn-gradient inline-block">
                <span>Add your first book</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-6 text-center">
                  <p className="text-4xl font-bold text-gradient mb-2">{totalBooks}</p>
                  <p className="text-neutral-400 text-sm">Total Books</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <p className="text-4xl font-bold text-gradient mb-2">{finishedCount}</p>
                  <p className="text-neutral-400 text-sm">Finished</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <p className="text-4xl font-bold text-gradient mb-2">{readingCount}</p>
                  <p className="text-neutral-400 text-sm">Reading</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <p className="text-4xl font-bold text-gradient mb-2">{tbrCount}</p>
                  <p className="text-neutral-400 text-sm">TBR</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold text-lg mb-4">Reading Progress</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-400">Finished</span>
                      <span className="text-white font-semibold">{finishedCount} / {totalBooks}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-accent to-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${totalBooks > 0 ? (finishedCount / totalBooks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-400">Currently Reading</span>
                      <span className="text-white font-semibold">{readingCount} / {totalBooks}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500"
                        style={{ width: `${totalBooks > 0 ? (readingCount / totalBooks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-400">To Be Read</span>
                      <span className="text-white font-semibold">{tbrCount} / {totalBooks}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-secondary to-accent h-full rounded-full transition-all duration-500"
                        style={{ width: `${totalBooks > 0 ? (tbrCount / totalBooks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-surface-dark/90 backdrop-blur-lg border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex justify-around py-2">
              <Link href="/library" className="nav-item">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-xs">Library</span>
              </Link>
              <Link href="/scan" className="nav-item">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M6 20h2m-4-8h2m14 0h2" />
                </svg>
                <span className="text-xs">Scan</span>
              </Link>
              <Link href="/stats" className="nav-item active">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-xs">Stats</span>
              </Link>
              <Link href="/profile" className="nav-item">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs">Profile</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </main>
  );
}



