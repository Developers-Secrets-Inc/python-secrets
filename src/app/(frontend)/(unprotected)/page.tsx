import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Code2,
  ArrowRight,
  Terminal,
  Zap,
  BookOpen,
  Rocket,
  Cpu,
  Check,
  Play,
  Users,
  TrendingUp,
  Shield,
  Globe,
  Lock,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl border-x">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-32">
          <div className="container px-6">
            <div className="grid gap-8 lg:grid-cols-2">
            <div className="w-full space-y-5">
              <div className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-green-500"></span>
                <span className="text-sm text-muted-foreground uppercase">Now Enrolling</span>
              </div>
              <h1 className="mt-3 max-w-2xl text-5xl font-semibold tracking-tighter lg:text-6xl">
                Master Python Through{" "}
                <span className="relative inline-block bg-neutral-100 px-2 py-2 dark:bg-neutral-900">
                  <span className="relative z-10">Real Projects</span>
                </span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Join 10,000+ developers who've accelerated their careers with our hands-on
                approach. Average 40% faster learning and 25% salary increase.
              </p>
              <div className="mt-10 flex gap-3">
                <Button size="lg" className="rounded-full px-8">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  View Curriculum
                </Button>
              </div>
              <ul className="space-y-4 mt-8">
                <li className="flex gap-4 items-center">
                  <Check className="size-5 text-primary" />
                  <p className="font-medium">
                    10x Faster Learning<span className="pl-2 text-muted-foreground">Build real projects, not toy examples</span>
                  </p>
                </li>
                <li className="flex gap-4 items-center">
                  <Check className="size-5 text-primary" />
                  <p className="font-medium">
                    Industry-Relevant Skills<span className="pl-2 text-muted-foreground">Learn what companies actually need</span>
                  </p>
                </li>
                <li className="flex gap-4 items-center">
                  <Check className="size-5 text-primary" />
                  <p className="font-medium">
                    50+ Projects<span className="pl-2 text-muted-foreground">Production-ready code you can showcase</span>
                  </p>
                </li>
                <li className="flex gap-4 items-center">
                  <Check className="size-5 text-primary" />
                  <p className="font-medium">
                    Career Support<span className="pl-2 text-muted-foreground">Resume reviews and interview prep</span>
                  </p>
                </li>
                <li className="flex gap-4 items-center">
                  <Check className="size-5 text-primary" />
                  <p className="font-medium">
                    Proven Results<span className="pl-2 text-muted-foreground">Students hired at top tech companies</span>
                  </p>
                </li>
              </ul>
            </div>
            <div className="h-full w-full rounded-2xl bg-muted p-6 border">
              <div className="relative h-full flex items-center justify-center">
                <Terminal className="h-48 w-48 text-muted-foreground/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <pre className="text-sm bg-background p-4 rounded-lg border overflow-hidden max-w-full">
                    <code>{`# Your journey starts here
$ python secrets.py

🚀 Loading curriculum...
   ✓ 50+ projects ready
   ✓ 100+ hours of content
   ✓ Real-world applications

>>> skills.learn()
Becoming a Python expert...
Progress: [████████░░] 80%

>>> career.boost()
Salary increased by 25% ✓
New job opportunities unlocked ✓

Ready to start? Press Enter...`}</code>
                  </pre>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-20 border-y">
          <div className="container px-6">
            <div className="text-center mb-12">
              <p className="text-sm text-muted-foreground uppercase mb-6">Trusted by developers from</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
              {["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix"].map((company) => (
                <div key={company} className="text-xl font-semibold text-muted-foreground">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32">
          <div className="container px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Everything you need to master Python
              </h2>
              <p className="text-lg text-muted-foreground">
                A complete learning platform designed to take you from beginner to expert
              </p>
            </div>
            <div className="grid divide-x border-y border-x md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Code2,
                  title: "Hands-On Projects",
                  description: "Build 50+ real-world applications from scratch. No toy examples, only production-ready code.",
                },
                {
                  icon: Users,
                  title: "Expert Mentorship",
                  description: "Get feedback from senior engineers with 10+ years of industry experience.",
                },
                {
                  icon: TrendingUp,
                  title: "Career Focus",
                  description: "Resume reviews, mock interviews, and direct connections to hiring partners.",
                },
                {
                  icon: Shield,
                  title: "Best Practices",
                  description: "Learn clean code, testing, debugging, and deployment from day one.",
                },
                {
                  icon: Globe,
                  title: "Global Community",
                  description: "Join 10,000+ developers worldwide. Learn together and grow your network.",
                },
                {
                  icon: Lock,
                  title: "Lifetime Access",
                  description: "Once enrolled, access all content forever. Including future updates.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`group relative p-6 hover:shadow-lg transition-all ${i < 3 ? 'border-b' : ''}`}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Curriculum Section */}
        <section id="curriculum" className="py-32">
          <div className="container px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Comprehensive Curriculum
              </h2>
              <p className="text-lg text-muted-foreground">
                From fundamentals to advanced topics, cover everything you need
              </p>
            </div>
            <div className="grid divide-x border-y border-x md:grid-cols-2">
              {[
                {
                  level: "Beginner",
                  weeks: "Weeks 1-4",
                  topics: ["Python Basics", "Data Types", "Control Flow", "Functions", "Modules"],
                  project: "Build a CLI Tool",
                },
                {
                  level: "Intermediate",
                  weeks: "Weeks 5-8",
                  topics: ["OOP", "File Handling", "Error Handling", "Testing", "APIs"],
                  project: "Create a Web Scraper",
                },
                {
                  level: "Advanced",
                  weeks: "Weeks 9-12",
                  topics: ["Decorators", "Generators", "Async/Await", "Databases", "Deployment"],
                  project: "Build a SaaS Application",
                },
                {
                  level: "Expert",
                  weeks: "Weeks 13-16",
                  topics: ["System Design", "Performance", "Security", "Microservices", "CI/CD"],
                  project: "Launch a Production System",
                },
              ].map((module, i) => (
                <div
                  key={i}
                  className={`relative p-8 ${i < 2 ? 'border-b' : ''}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Badge variant="outline">{module.level}</Badge>
                    <span className="text-sm text-muted-foreground">{module.weeks}</span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold">{module.level} Track</h3>
                  <ul className="mb-6 space-y-2">
                    {module.topics.map((topic, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Rocket className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{module.project}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="container px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Ready to start your Python journey?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Join thousands of developers who've transformed their careers. Start learning
                today with our free tier.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="rounded-full px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Cancel anytime
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  30-day money back
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="[&:not(:last-child)]:pt-0 border-t py-16">
          <div className="container px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <Code2 className="h-6 w-6" />
                  <span className="text-xl font-bold">Python Secrets</span>
                </div>
                <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                  Master Python through real projects. Join 10,000+ developers who've
                  accelerated their careers with our hands-on approach.
                </p>
                <div className="flex gap-4">
                  <Button variant="ghost" size="icon">
                    <Github className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="mb-4 font-semibold">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#features" className="text-muted-foreground hover:text-foreground">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#curriculum" className="text-muted-foreground hover:text-foreground">
                      Curriculum
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      Testimonials
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 font-semibold">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 font-semibold">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
              <p>© 2025 Python Secrets. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
