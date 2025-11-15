'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getProvinces() {
    const payload=await getPayload({config:configPromise})
    try{
        const provinces=await payload.find({
            collection:'provinces',
            draft:false,
            overrideAccess:false,
            select:{name:true,code:true},
            sort:'name',
        })
        return provinces.docs
    }catch(error){
        console.error('Error fetching provinces:',error)
        return []
    }
}
