'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Community, User } from '@/payload-types'

export const getPostByUser=async(limit:number, user:User)=>{
    const payload=await getPayload({config:configPromise})

    try{
        const posts=await payload.find({
            collection:'socialPosts',
            draft:false,
            overrideAccess:false,
            limit:limit,
            sort:'createdAt',
            where:{author:{equals:user.id}}
        })
        return posts.docs
    }catch(error){
        console.error('Error fetching posts:',error)
        return []
    }
}
export const getPostByCommunity=async(limit:number, community:Community)=>{
    const payload=await getPayload({config:configPromise})
    try{
        const posts=await payload.find({
            collection:'socialPosts',
            draft:false,
            overrideAccess:false,
            limit:limit,
            sort:'createdAt',
            where:{community:{equals:community.id}}
        })
        return posts.docs
    }catch(error){
        console.error('Error fetching posts:',error)
        return []
    }
}
export const getPosts=async(limit:number)=>{
    const payload=await getPayload({config:configPromise})
    try{
        const posts=await payload.find({
            collection:'socialPosts',
            draft:false,
            overrideAccess:false,
            limit:limit,
            sort:'createdAt',
        })
        return posts.docs
    }catch(error){
        console.error('Error fetching posts:',error)
        return []
    }
}
    