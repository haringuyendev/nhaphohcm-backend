
'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const getConversations=async ()=>{
   const payload = await getPayload({ config: configPromise })

  const results = await payload.find({
    collection: "conversations",
    depth: 2,
    sort: "-updatedAt",
    overrideAccess: false,
  })

  return results
}

export const getConversationById=async (id:string)=>{
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
        collection: "conversations",
        where: {
            id: { equals: id },
        },
        depth: 2,
        overrideAccess: false,
    })

    return result
}

export const getMessages=async()=>{
  const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
        collection: "messages",
        depth: 3,
        overrideAccess: false,
    })

    return result
}