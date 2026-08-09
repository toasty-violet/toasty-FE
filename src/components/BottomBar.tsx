export function BottomBar() {
  return (
    <footer className="border-t border-black/[.08] py-6 text-center text-sm text-zinc-500 dark:border-white/[.145] dark:text-zinc-400">
      © {new Date().getFullYear()} Toasty
    </footer>
  );
}
