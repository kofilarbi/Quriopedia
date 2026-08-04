export async function shareContent(params: {
  title: string
  text: string
  url: string
}): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(params)
      return 'shared'
    } catch (err) {
      if ((err as Error).name === 'AbortError') return 'failed'
      // navigator.share not supported in this context — fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(`${params.text}\n${params.url}`)
    return 'copied'
  } catch {
    return 'failed'
  }
}
