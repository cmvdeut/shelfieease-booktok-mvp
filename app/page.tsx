import Link from "next/link";

export default function Page() {
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mt-0 mb-4">📚 ShelfieEase</h1>
      <p className="text-gray-400 mb-6">
        Scan books. Build your shelf. Share the vibe.
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href="/scan"
          className="w-full px-4 py-3 rounded-xl bg-purple-600 text-white font-bold text-center no-underline hover:bg-purple-700"
        >
          Scan a book
        </Link>
        <Link
          href="/library"
          className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white font-bold text-center no-underline hover:bg-gray-700"
        >
          My Shelf
        </Link>
      </div>
    </main>
  );
}
