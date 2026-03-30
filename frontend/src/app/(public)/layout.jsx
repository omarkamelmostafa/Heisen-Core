// frontend/src/app/(public)/layout.jsx
import { Header } from "@/components/layout/header";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {children}
    </div>
  );
}
