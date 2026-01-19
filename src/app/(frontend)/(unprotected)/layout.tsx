import { AppHeader } from "@/components/headers/app-header";
import { PyodideScript } from "@/components/core/pyodide-script";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PyodideScript />
      <div className="flex flex-col h-screen">
        <AppHeader />
        {children}
      </div>
    </>
  )
}