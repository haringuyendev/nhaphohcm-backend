import { ApiError } from 'next/dist/server/api-utils'
import type { CollectionBeforeValidateHook } from 'payload'
import {getPlaiceholder} from 'plaiceholder';

export const generateBlurHash:CollectionBeforeValidateHook = async ({data, operation, req}) => {
 if(operation=='update'||operation=='create') {
  try{
    const buffer=req.file?.data;
    if(buffer){
        const {base64} = await getPlaiceholder(buffer, {size:32});
        return{
            ...data,
            blurhash:base64
        }
    }
  }catch(error){
    throw new ApiError(400,'Failed to generate blur hash data url')
  }
 }
}
