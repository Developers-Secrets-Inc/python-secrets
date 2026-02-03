import { LoginForm } from "@/components/forms/login-form"

export default function Page() {
  return (
    <div className="flex flex-1 w-full items-center justify-center p-6 md:p-10">
      <div className="fixed left-0 right-0 top-1/4 border-t border-dashed pointer-events-none"></div>
      <div className="fixed top-0 bottom-0 left-[calc(50%-12rem)] border-l border-dashed pointer-events-none"></div>
      <div className="fixed top-0 bottom-0 right-[calc(50%-12rem)] border-r border-dashed pointer-events-none"></div>
      <div className="fixed left-0 right-0 bottom-[20%] border-b border-dashed pointer-events-none"></div>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
