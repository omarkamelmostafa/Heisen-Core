import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tailwind is Working! 🎉
          </h1>
          <h2 className="text-4xl font-bold text-green-900 mb-4">kamel</h2>
          <p className="text-lg text-gray-600 mb-8">
            If you see styled text, Tailwind is configured correctly.
          </p>
          <Button className="btn-primary">Test Button</Button>
        </div>
      </div>
    </main>
  );
}
