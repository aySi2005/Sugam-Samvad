function Header({ connected }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10">
            <span className="text-xl">🌐</span>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Diplom<span className="text-blue-400">AI</span>
            </h1>

            <p className="text-xs tracking-wide text-slate-500">
              REAL-TIME DIPLOMATIC INTERPRETATION
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              connected
                ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
                : "bg-red-400"
            }`}
          />

          <span className="text-sm font-medium text-slate-300">
            {connected ? "System Connected" : "Disconnected"}
          </span>
        </div>

      </div>
    </header>
  );
}

export default Header;