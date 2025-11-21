import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'properties',
    limit: 0,
    where: {},
  })

  const url = getServerSideURL()

  return [
    {
      url: `${url}/`,
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: `${url}/`
        }
      }
    },
    {
      url: `${url}/tin-dang`,
      lastModified: new Date(),
      alternates: {
        languages: {
          vi: `${url}/tin-dang`
        }
      }
    },
    ...posts.docs.map(({ slug, updatedAt }) => (
      {
        url: `${url}/tin-dang/${slug}`,
        lastModified: new Date(updatedAt),
        alternates: {
          languages: {
            vi: `${url}/tin-dang/${slug}`
          }
        }
      }
    )),
  ]

}