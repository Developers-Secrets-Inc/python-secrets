import { AppHeader } from "@/components/headers/app-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      {children}
    </div>
  )
}