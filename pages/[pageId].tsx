import * as React from 'react'
import { GetStaticProps } from 'next'
import { NotionPage } from '@/components/NotionPage'
import { domain, isDev } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'
import { resolveNotionPage } from '@/lib/resolve-notion-page'
import { PageProps, Params } from '@/lib/types'

export const config = {
  runtime: 'nodejs', // or "edge"
}

export const getStaticProps: GetStaticProps<PageProps, Params> = async (
  context
) => {
  const rawPageId = context.params.pageId as string

  try {
    const props = await resolveNotionPage(domain, rawPageId)

    return { props, revalidate: parseInt(process.env.REVALIDATE) }
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

  console.log(staticPaths.paths)
  return staticPaths
}

export default function NotionDomainDynamicPage(props: JSX.IntrinsicAttributes & PageProps) {
  return <NotionPage {...props} />
}

// export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
//   if (req.method !== 'GET') {
//     res.statusCode = 405
//     res.setHeader('Content-Type', 'application/json')
//     res.write(JSON.stringify({ error: 'method not allowed' }))
//     res.end()
//     return { props: {} }
//   }
//   const rawPageId = params?.pageId as string

//   const ttlSeconds = 60

//   res.setHeader(
//     'Cache-Control',
//     `public, max-age=${ttlSeconds}, stale-while-revalidate=${ttlSeconds}`
//   )


//   try {
//     const props = await resolveNotionPage(domain, rawPageId)
//     return { props: { ...props } }
//   } catch (err) {
//     console.error('page error', domain, rawPageId, err)
//     throw err
//   }
// }