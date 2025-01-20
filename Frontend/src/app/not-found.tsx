import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NotFoundContent } from '@/components/not-found-content';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto">
        <NotFoundContent />
      </main>
      <Footer />
    </div>
  );
} 