import { getSiteMap } from '@/lib/get-site-map'
import { PageProps } from '@/lib/types'
import { NotionPage } from '@/components/NotionPage'
import { domain } from '@/lib/config'
import { resolveNotionPage } from '@/lib/resolve-notion-page'
import omit from 'lodash.omit'
import type { ExtendedRecordMap } from 'notion-types'
import { normalizeTitle } from 'notion-utils'

export const runtime = "nodejs"

const tagsPropertyNameLowerCase = 'tags'

async function getPageProps(tagName: string): Promise<PageProps> {
    try {
        const props = await resolveNotionPage(process.env.BLOG_PAGE_ID)
        let propertyToFilterName: string = null

        if (props.recordMap) {
            const recordMap = props.recordMap as ExtendedRecordMap
            const collection = Object.values(recordMap.collection)[0]?.value

            if (collection) {
                const galleryView = Object.values(recordMap.collection_view).find(
                    (view) => view.value?.type === 'gallery'
                )?.value

                if (galleryView) {
                    const galleryBlock = Object.values(recordMap.block).find(
                        (block) =>
                            block.value?.type === 'collection_view' &&
                            block.value.view_ids?.includes(galleryView.id)
                    )

                    if (galleryBlock?.value) {
                        recordMap.block = {
                            [galleryBlock.value.id]: galleryBlock,
                            ...omit(recordMap.block, [galleryBlock.value.id])
                        }

                        const propertyToFilter = Object.entries(collection.schema).find(
                            (property) =>
                                property[1]?.name?.toLowerCase() === tagsPropertyNameLowerCase
                        )

                        const propertyToFilterId = propertyToFilter?.[0]
                        const filteredValue = normalizeTitle(tagName)
                        propertyToFilterName = propertyToFilter?.[1]?.options.find(
                            (option) => normalizeTitle(option.value) === filteredValue
                        )?.value ?? null

                        if (propertyToFilterId && filteredValue) {
                            const query =
                                recordMap.collection_query[collection.id]?.[galleryView.id]
                            const queryResults = query?.collection_group_results ?? query

                            if (queryResults) {
                                queryResults.blockIds = queryResults.blockIds.filter((id) => {
                                    const block = recordMap.block[id]?.value
                                    if (!block || !block.properties) {
                                        return false
                                    }

                                    const value = block.properties[propertyToFilterId]?.[0]?.[0]
                                    if (!value) {
                                        return false
                                    }

                                    const values = value.split(',')
                                    if (
                                        !values.find(
                                            (value: string) => normalizeTitle(value) === filteredValue
                                        )
                                    ) {
                                        return false
                                    }

                                    return true
                                })
                            }
                        }
                    }
                }
            }
        }

        return {
            ...props,
            tagsPage: true,
            propertyToFilterName
        }
    } catch (err) {
        console.error('page error', domain, tagName, err)
        throw err
    }
}

export async function generateStaticParams() {
    const siteMap = await getSiteMap()
    return Object.keys(siteMap.canonicalPageMap)
        .map(pageId => { params: { tagName: pageId } })
}

export default async function NotionTagsPage({ params }) {
    const pageProps = await getPageProps(params.tagName);
    return <NotionPage {...pageProps} />
}
