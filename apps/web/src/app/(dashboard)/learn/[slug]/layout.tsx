/** Full-height learn workspace container. */
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-full flex flex-col overflow-hidden">{children}</div>;
}
