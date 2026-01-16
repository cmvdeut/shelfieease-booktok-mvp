'use client';

import { useState } from 'react';
import Link from 'next/link';

// Voorbeeld boeken data (later te vervangen door echte data)
const sampleBooks = [
  {
    id: 1,
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    cover: 'https://covers.openlibrary.org/b/isbn/9780062060624-M.jpg',
    isbn: '9780062060624',
    status: 'finished',
    rating: 5,
  },
  {
    id: 2,
    title: 'Fourth Wing',
    author: 'Rebecca Yarros',
    cover: 'https://covers.openlibrary.org/b/isbn/9781649374042-M.jpg',
    isbn: '9781649374042',
    status: 'reading',
    rating: 0,
  },
  {
    id: 3,
    title: 'House of Salt and Sorrows',
    author: 'Erin A. Craig',
    cover: 'https://covers.openlibrary.org/b/isbn/9781984831927-M.jpg',
    isbn: '9781984831927',
    status: 'tbr',
    rating: 0,
  },
];

type BookStatus = 'all' | 'reading' | 'tbr' | 'finished';

export default function Library() {
  const [activeFilter, setActiveFilter] = useState<BookStatus>('all');
  const [books] = useState(sampleBooks);

  const filteredBooks = activeFilter === 'all' 
    ? books 
    : books.filter(book => book.status === activeFilter);

  const statusLabels = {
    reading: 'Reading',
    tbr: 'TBR',
    finished: 'Finished',
  };

  const statusColors = {
    reading: 'badge-reading',
    tbr: 'badge-tbr',
    finished: 'badge-finished',
  };

  return (
    <main className="min-h-screen bg-surface-dark">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-surface-dark/80 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span className="font-display font-bold text-gradient">ShelfieEase</span>
              </Link>
              
              <Link href="/scan" className="btn-gradient px-4 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Book
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <section className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold text-gradient">{books.filter(b => b.status === 'reading').length}</p>
              <p className="text-sm text-neutral-400">Reading</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold text-gradient">{books.filter(b => b.status === 'tbr').length}</p>
              <p className="text-sm text-neutral-400">TBR</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold text-gradient">{books.filter(b => b.status === 'finished').length}</p>
              <p className="text-sm text-neutral-400">Finished</p>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="container mx-auto px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['all', 'reading', 'tbr', 'finished'] as BookStatus[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-gradient-primary text-white'
                    : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All Books' : filter === 'tbr' ? 'TBR' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* Book Grid */}
        <section className="container mx-auto px-4 pb-24">
          {filteredBooks.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-white font-semibold text-xl mb-2">No books yet</h3>
              <p className="text-neutral-400 mb-6">Start building your collection!</p>
              <Link href="/scan" className="btn-gradient inline-block">
                <span>Scan your first book</span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="book-card animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Book Cover */}
                  <div className="flex-shrink-0">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="book-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="112" viewBox="0 0 80 112"><rect fill="%231A1A2E" width="80" height="112"/><text x="40" y="56" font-family="Arial" font-size="32" fill="%23A855F7" text-anchor="middle">📚</text></svg>';
                      }}
                    />
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-white font-semibold truncate">{book.title}</h3>
                      <span className={statusColors[book.status as keyof typeof statusColors]}>
                        {statusLabels[book.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-sm mb-2">{book.author}</p>
                    
                    {/* Rating */}
                    {book.status === 'finished' && (
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`star ${star <= book.rating ? 'filled' : ''}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-neutral-500 text-xs mt-2">ISBN: {book.isbn}</p>
                  </div>

                  {/* Actions */}
                  <button className="flex-shrink-0 p-2 text-neutral-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-surface-dark/90 backdrop-blur-lg border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex justify-around py-2">
              <Link href="/library" className="nav-item active">
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
              <Link href="/stats" className="nav-item">
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
