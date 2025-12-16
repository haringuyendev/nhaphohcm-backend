'use server'
import { User } from "@/payload-types";
import { getPayload } from "payload";
import configPromise from '@payload-config'

export const sendMessage = async (conversationId: string, text: string, sender:User, reciptients?:User|undefined) => {
    const payload = await getPayload({ config: configPromise })
    let conversation_id=conversationId
    if(reciptients){
        const conversation=await payload.create({
            collection:'conversations',
            data:{
                title:reciptients.name,
                participants:[sender, reciptients],
                participantsKey:`${sender.id}-${reciptients.id}`,
            }
        })
        conversation_id=conversation.id
    }
    
    const result = await payload.create({
        collection: "messages",
        data: {
            conversation: conversation_id,
            text,
            sender,
        },
    })
    return result
}