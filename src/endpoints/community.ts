'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { User } from '@/payload-types'

export const getCommunityMembersOfUser=async(limit:number, user:User)=>{
    const payload=await getPayload({config:configPromise})

    try{
        const communities=await payload.find({
            collection:'members',
            draft:false,
            overrideAccess:false,
            limit:limit,
            sort:'community.memberCount',
            where:{user:{equals:user.id}},
        })
        return communities.docs
    }catch(error){
        console.error('Error fetching communities:',error)
        return []
    }
}
export const getCommunities=async(limit:number)=>{
    const payload=await getPayload({config:configPromise})
    try{
        const communities=await payload.find({
            collection:'communities',
            draft:false,
            overrideAccess:false,
            limit:limit,
            sort:'memberCount',
        })
        return communities.docs
    }catch(error){
        console.error('Error fetching communities:',error)
        return []
    }
}