import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code2, Zap, Users, TrendingUp, Check } from "lucide-react"

export default function Page() {
  return (
    <section className="flex-1 flex items-center justify-center py-12 md:py-16 lg:py-20 w-full">
      <div className="border-t border-b border-dashed w-full">
        <div className="relative flex w-full max-w-5xl flex-col justify-center border border-t-0 border-dashed px-4 py-8 md:px-5 md:py-12 lg:mx-auto">
          <Badge variant="secondary" className="w-fit gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto text-xs">
            <span className="inline-block size-2 rounded-full bg-emerald-500"></span>
            NEW COURSES EVERY WEEK
          </Badge>
          <h1 className="mt-6 mb-6 w-full text-center text-3xl font-semibold tracking-tighter sm:text-4xl md:mb-8 md:text-5xl lg:mb-10 lg:text-6xl">
            A Smarter Way to <br />
            <span className="text-primary">Master Python</span>
          </h1>
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center border border-t-0 border-b-0 border-dashed py-8 md:py-12 lg:py-16">
          <div className="w-full max-w-2xl space-y-4 px-4 md:space-y-5 md:px-5 md:text-center">
            <p className="text-sm text-muted-foreground md:text-base lg:text-lg">
              Master Python programming through interactive lessons, real-world projects, and comprehensive learning paths designed to take you from beginner to advanced.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/signup">Get Started Now</Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>

        <ul className="mx-auto grid w-full max-w-5xl grid-cols-1 border border-b-0 border-dashed md:grid-cols-2 lg:grid-cols-3">
          <li className="flex items-center justify-between gap-4 border-t border-dashed px-4 py-6 md:border-l md:gap-3 md:px-5 md:py-4 lg:justify-center lg:border-t-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-muted-foreground/20 sm:size-12">
              <Zap className="size-5 text-muted-foreground sm:size-6" />
            </div>
            <p className="text-base text-muted-foreground md:text-lg">Interactive Lessons</p>
          </li>
          <li className="flex items-center justify-between gap-4 border-t border-l border-dashed px-4 py-6 md:gap-3 md:px-5 md:py-4 lg:justify-center">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-muted-foreground/20 sm:size-12">
              <Users className="size-5 text-muted-foreground sm:size-6" />
            </div>
            <p className="text-base text-muted-foreground md:text-lg">Expert Guidance</p>
          </li>
          <li className="flex items-center justify-between gap-4 border-t border-l border-dashed px-4 py-6 col-span-1 md:col-span-2 md:justify-center md:gap-3 md:px-5 md:py-4 lg:col-span-1 lg:border-t-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-muted-foreground/20 sm:size-12">
              <TrendingUp className="size-5 text-muted-foreground sm:size-6" />
            </div>
            <p className="text-base text-muted-foreground md:text-lg">Real-World Projects</p>
          </li>
        </ul>
      </div>

    </section>
  )
}