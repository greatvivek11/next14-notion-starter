import * as React from 'react'
import type { GetStaticProps } from 'next'
import { NotionPage } from '@/components/NotionPage'
import { domain, isDev } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'
import { resolveNotionPage } from '@/lib/resolve-notion-page'
import type { PageProps, Params } from '@/lib/types'

// This is needed to generate pages at runtime dynamically using ISR.
export const config = {
  runtime: 'nodejs', // or "edge"
}

export const getStaticProps: GetStaticProps<PageProps, Params> = async (
  context
) => {
  const rawPageId = context.params.pageId as string

  try {
    const props = await resolveNotionPage(domain, rawPageId)

    return { props, revalidate: Number.parseInt(process.env.REVALIDATE) }
  } catch (err) {
    console.error('page error', domain, rawPageId, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export async function getStaticPaths() {
  if (isDev) {
    return {
      paths: [],
      fallback: true
    }
  }

  const siteMap = await getSiteMap()

  const staticPaths = {
    paths: Object.keys(siteMap.canonicalPageMap).map((pageId) => ({
      params: {
        pageId
      }
    })),
    // paths: [],
    fallback: 'blocking'
  }

  // console.log(staticPaths.paths)
  return staticPaths
}

export default function NotionDomainDynamicPage(props: JSX.IntrinsicAttributes & PageProps) {
  return <NotionPage {...props} />
}
