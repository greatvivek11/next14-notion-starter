import React from 'react'
import type { AppProps } from 'next/app'
// global styles shared across the entire site
// used for rendering equations (optional)
import 'katex/dist/katex.min.css'
// used for code syntax highlighting (optional)
import 'prismjs/themes/prism-coy.css'
// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css'
import '@/styles/global.css'
// this might be better for dark mode
// import 'prismjs/themes/prism-okaidia.css'
// global style overrides for notion
import '@/styles/notion.css'
// global style overrides for prism theme (optional)
import { SpeedInsights } from "@vercel/speed-insights/next"
import '@/styles/prism-theme.css'
import { Analytics } from "@vercel/analytics/react"

export default function App({ Component, pageProps }: AppProps) {
  return <>
  {/* Remove analytics if not needed */}
    <SpeedInsights />
    <Analytics />
    <Component {...pageProps} />
  </>
}