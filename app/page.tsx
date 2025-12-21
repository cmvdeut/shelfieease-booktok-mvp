import Link from "next/link";

export default function Page() {
  return (
    <main className="p-4 max-w-[720px] mx-auto">
      <h1 className="text-4xl font-bold mt-0 mb-4">📚 ShelfieEase</h1>
      <p className="text-gray-400 mb-6">
        Scan books. Build your shelf. Share the vibe.
      </p>

      <div className="flex flex-col gap-2.5">
        <Link
          href="/scan"
          className="w-full px-3 py-3 rounded-[14px] bg-[#6d5efc] text-white font-bold text-center no-underline hover:bg-[#5d4eec] transition-colors"
        >
          Scan a book
        </Link>
        <Link
          href="/library"
          className="w-full px-3 py-3 rounded-[14px] bg-[#2a2a32] text-white font-bold text-center no-underline hover:bg-[#3a3a42] transition-colors"
        >
          My Shelf
        </Link>
      </div>
    </main>
  );
}
