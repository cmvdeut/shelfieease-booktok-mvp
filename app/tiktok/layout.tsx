export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function TikTokLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
