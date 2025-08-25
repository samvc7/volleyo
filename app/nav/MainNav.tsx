import { SessionNav } from "./SessionNav"

export const MainNav = async () => {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800  shadow-md p-2 ">
      <div className="container flex items-center max-w-screen-2xl gap-2">
        <span className="text-xl font-bold tracking-tight">Volleyo</span>
        <SessionNav />
      </div>
    </header>
  )
}
