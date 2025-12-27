import { redirect } from "next/navigation";

export default function AddPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const raw = searchParams?.isbn;
  const isbn = Array.isArray(raw) ? raw[0] : raw;

  if (!isbn) {
    redirect("/scan");
  }

  redirect(`/library?isbn=${encodeURIComponent(isbn)}`);
}



