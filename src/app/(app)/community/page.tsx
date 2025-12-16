import CommunityComponent from './page.client';
import { getCommunities, getCommunityMembersOfUser } from '@/endpoints/community';
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export default async function Index() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const communities = await getCommunities(50)
  const memberRecords = await getCommunityMembersOfUser(50, user!)

  // Lấy danh sách communityId mà user đã join
  const joinedIds = new Set(
    memberRecords.map((m) =>
      typeof m.community === 'string' ? m.community : m.community.id
    )
  )

  // Community đã join
  const communityUsersJoined = communities.filter((c) => joinedIds.has(c.id))

  // Community chưa join
  const communityUsersNotJoined = communities.filter((c) => !joinedIds.has(c.id))

  return (
    <CommunityComponent
      communities={communityUsersJoined}
      recommendCommunities={communityUsersNotJoined}
    />
  )
}
