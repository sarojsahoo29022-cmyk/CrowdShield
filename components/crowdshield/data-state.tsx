export function DataState({ loading, error }: { loading: boolean; error: string | null }) {
  if (error) {
    return <p role="status" className="font-mono text-[10px] text-caution">Demo fallback in use — {error}</p>
  }

  if (loading) {
    return <p role="status" className="font-mono text-[10px] text-muted-foreground">Loading demo data…</p>
  }

  return null
}
