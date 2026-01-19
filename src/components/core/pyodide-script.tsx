'use client'

import Script from 'next/script'

export function PyodideScript() {
  return (
    <Script
      src="https://cdn.jsdelivr.net/pyodide/v0.29.1/full/pyodide.js"
      strategy="beforeInteractive"
    />
  )
}
