import Link from "next/link";
import { Course, CourseLevel } from "@/types/course";

const getLevelStyles = (level: CourseLevel) => {
  switch (level) {
    case "BEGINNER":
      return "text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/20";
    case "INTERMEDIATE":
      return "text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900/50 dark:bg-amber-950/20";
    case "ADVANCED":
      return "text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-400 dark:border-rose-900/50 dark:bg-rose-950/20";
    default:
      return "text-zinc-500 border-zinc-200 bg-zinc-50";
  }
};

export function CourseCard({ course }: { course: Course }) {
  console.log(course)
  
  return (
    <Link
      href={`/courses/${course.id}`}
      className="grid grid-cols-12 gap-4 sm:gap-8 py-10 sm:py-16 px-4 sm:px-8 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors group cursor-pointer relative overflow-hidden"
    >
      {course.status === "completed" && (
        <div className="absolute top-0 right-0 bg-emerald-700 text-white px-4 py-1.5 text-[10px] font-black tracking-[0.2em] shadow-sm">
          COMPLETED
        </div>
      )}

      <div className="col-span-12 md:col-span-2 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-3">
        <span className="text-zinc-400 font-bold text-xs tracking-widest group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
          [{course.code}]
        </span>
        <span
          className={`text-[9px] border px-2 py-0.5 font-bold transition-colors ${getLevelStyles(
            course.level
          )}`}
        >
          {course.level}
        </span>
      </div>

      <div className="col-span-12 md:col-span-7 flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline underline-offset-[12px] decoration-2">
          {course.title}
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed normal-case font-medium max-w-lg">
          {course.description}
        </p>
      </div>

      <div className="col-span-12 md:col-span-3 flex flex-row md:flex-col items-center md:items-end justify-between pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-900">
        <div className="md:text-right">
          <span className="block text-[10px] text-zinc-400 font-bold">
            Duration
          </span>
          <span className="text-base font-bold tabular-nums tracking-normal">
            {course.duration}
          </span>
        </div>

        <div className="mt-0 md:mt-6">
          <CourseButton status={course.status} />
        </div>
      </div>
    </Link>
  );
}

function CourseButton({ status }: { status: Course["status"] }) {
  if (status === "coming_soon") {
    return (
      <span className="text-[11px] text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 px-6 py-2">
        LOCKED
      </span>
    );
  }

  return (
    <div
      className={`border-2 px-6 py-2 bg-transparent transition-none text-xs font-bold tracking-widest whitespace-nowrap ${
        status === "completed"
          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-white"
          : "border-black dark:border-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black"
      }`}
    >
      {status === "completed" ? "REWATCH" : "EXEC_COURSE"}
    </div>
  );
}