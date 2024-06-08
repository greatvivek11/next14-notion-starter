'use client'
import cs from 'classnames'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import type { PageBlock } from 'notion-types'
import {
  formatDate,
  getBlockTitle,
  getPageProperty,
  normalizeTitle
} from 'notion-utils'
import React from 'react'
import BodyClassName from 'react-body-classname'
import { NotionRenderer } from 'react-notion-x'
import TweetEmbed from 'react-tweet-embed'
import { useSearchParam } from 'react-use'

import * as config from '@/lib/config'
import { mapImageUrl } from '@/lib/map-image-url'
import { getCanonicalPageUrl, mapPageUrl } from '@/lib/map-page-url'
import { searchNotion } from '@/lib/search-notion'
import type * as types from '@/lib/types'
import { useDarkMode } from '@/lib/use-dark-mode'

import { showCollectionViewDropdown } from '@/lib/config'
import { Footer } from './Footer'
import { NotionPageHeader } from './NotionPageHeader'
import { Page404 } from './Page404'
import { PageAside } from './PageAside'
import { PageHead } from './PageHead'
import styles from './styles.module.css'

// -----------------------------------------------------------------------------
// dynamic imports for optional components
// -----------------------------------------------------------------------------

const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then(async (m) => {
    // add / remove any prism syntaxes here
    await Promise.allSettled([
      import('prismjs/components/prism-bash.js'),
      import('prismjs/components/prism-csharp.js'),
      import('prismjs/components/prism-js-templates.js'),
      import('prismjs/components/prism-python.js'),
      import('prismjs/components/prism-rust.js'),
      import('prismjs/components/prism-sql.js'),
      import('prismjs/components/prism-yaml.js')
    ])
    return m.Code
  }),
  {
    ssr: true
  }
)

const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then(
    (m) => m.Collection
  ),
  {
    ssr: true
  }
)
const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation),
  {
    ssr: true
  }
)
const Pdf = dynamic(
  () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf),
  {
    ssr: true
  }
)

const Modal = dynamic(
  () =>
    import('react-notion-x/build/third-party/modal').then((m) => {
      m.Modal.setAppElement('.notion-viewport')
      return m.Modal
    }),
  {
    ssr: true
  }
)

const Tweet = ({ id }: { id: string }) => {
  return <TweetEmbed tweetId={id} />
}

function propertyLastEditedTimeValue({ block, pageHeader },
  defaultFn: () => React.ReactNode): React.ReactNode {
  if (pageHeader && block?.last_edited_time) {
    return `Last updated ${formatDate(block?.last_edited_time, {
      month: 'long'
    })}`
  }

  return defaultFn()
}

const propertyDateValue = (
  { data, schema, pageHeader },
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === 'published') {
    const publishDate = data?.[0]?.[1]?.[0]?.[1]?.start_date

    if (publishDate) {
      return `${formatDate(publishDate, {
        month: 'long'
      })}`
    }
  }

  return defaultFn()
}

function propertyTextValue({ schema, pageHeader },
  defaultFn: () => React.ReactNode): string | number | boolean | JSX.Element | React.ReactFragment | null | undefined {
  if (pageHeader && schema?.name?.toLowerCase() === 'author') {
    return <b>{defaultFn()}</b>
  }

  return defaultFn()
}

function propertySelectValue({ schema, value, key, pageHeader },
  defaultFn: () => React.ReactNode): string | number | boolean | JSX.Element | React.ReactFragment | null | undefined {
  value = normalizeTitle(value)

  if (pageHeader && schema.type === 'multi_select' && value) {
    return (
      <Link href={`/tags/${value}`} key={key}>
        {defaultFn()}
      </Link>
    )
  }

  return defaultFn()
}

export const NotionPage: React.FC<types.PageProps> = ({
  site,
  recordMap,
  error,
  pageId,
  tagsPage,
  propertyToFilterName
}) => {
  const lite = useSearchParam('lite')

  const components = React.useMemo(
    () => ({
      nextImage: Image,
      nextLink: Link,
      Code,
      Pdf,
      Collection,
      Equation,
      Modal,
      Tweet,
      Header: NotionPageHeader,
      propertyLastEditedTimeValue,
      propertyTextValue,
      propertyDateValue,
      propertySelectValue
    }),
    []
  )

  // lite mode is for oembed
  const isLiteMode = lite === 'true'

  const { isDarkMode } = useDarkMode()

  const siteMapPageUrl = React.useMemo(() => {
    const params: any = {}
    if (lite) params.lite = lite

    const searchParams = new URLSearchParams(params)
    return mapPageUrl(site, recordMap, searchParams)
  }, [site, recordMap, lite])

  const keys = Object.keys(recordMap?.block || {})
  const block = recordMap?.block?.[keys[0]]?.value 

  const isBlogPost =
    block?.type === 'page' && block?.parent_table === 'collection'

  const showTableOfContents = !!isBlogPost
  const isCollectionViewVisible = showCollectionViewDropdown
  const minTableOfContentsItems = 3

  const pageAside = React.useMemo(
    () => (
      <PageAside block={block} recordMap={recordMap} isBlogPost={isBlogPost} />
    ),
    [block, recordMap, isBlogPost]
  )

  const footer = React.useMemo(() => <Footer />, [])

  if (error || !site || !block) {
    return <Page404 site={site} pageId={pageId} error={error} />
  }

  const name = getBlockTitle(block, recordMap) || site.name
  const title =
    tagsPage && propertyToFilterName ? `${propertyToFilterName} ${name}` : name

  // console.log('notion page', {
  //   isDev: config.isDev,
  //   title,
  //   pageId,
  //   rootNotionPageId: site.rootNotionPageId,
  //   recordMap
  // })

  if (!config.isServer) {
    // add important objects to the window global for easy debugging
    const g = window as any
    g.pageId = pageId
    g.recordMap = recordMap
    g.block = block
  }

  const canonicalPageUrl =
    !config.isDev && getCanonicalPageUrl(site, recordMap)(pageId)

  const socialImage = mapImageUrl(
    getPageProperty<string>('Social Image', block, recordMap) ||
    (block as PageBlock).format?.page_cover ||
    config.defaultPageCover,
    block
  ) ?? undefined

  const socialDescription =
    getPageProperty<string>('Description', block, recordMap) ||
    config.description

  return (
    <>
      <PageHead
        pageId={pageId}
        site={site}
        title={title}
        description={socialDescription}
        image={socialImage}
        url={canonicalPageUrl}
      />

      {isLiteMode && <BodyClassName className='notion-lite' />}
      {isDarkMode && <BodyClassName className='dark-mode' />}

      <NotionRenderer
        bodyClassName={cs(
          styles.notion,
          pageId === site.rootNotionPageId && 'index-page',
          tagsPage && 'tags-page'
        )}
        darkMode={isDarkMode}
        components={components}
        recordMap={recordMap}
        rootPageId={site.rootNotionPageId}
        rootDomain={site.domain}
        fullPage={!isLiteMode}
        previewImages={!!recordMap.preview_images}
        showCollectionViewDropdown={isCollectionViewVisible}
        showTableOfContents={showTableOfContents}
        minTableOfContentsItems={minTableOfContentsItems}
        defaultPageIcon={config.defaultPageIcon}
        defaultPageCover={config.defaultPageCover}
        defaultPageCoverPosition={config.defaultPageCoverPosition}
        linkTableTitleProperties={true}
        mapPageUrl={siteMapPageUrl}
        mapImageUrl={mapImageUrl}
        searchNotion={config.isSearchEnabled ? searchNotion : null}
        pageAside={pageAside}
        footer={footer}
        pageTitle={tagsPage && propertyToFilterName ? title : undefined}
      />
    </>
  )
}