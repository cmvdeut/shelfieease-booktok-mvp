import HomePageClient from "@/components/HomePageClient";
import { homeMetadata } from "@/lib/seo";

export const metadata = homeMetadata;

export default function HomePage() {
  return <HomePageClient />;
}
