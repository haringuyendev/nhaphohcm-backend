// collections/communityMembers.ts
import { CollectionConfig } from 'payload';

const updateCommunityMemberCount = async ({ doc, operation, req }: any) => {
  const payload = req.payload;
  const communityId = typeof doc.community === 'object' ? doc.community.id : doc.community;

  if (!communityId) return doc;

  const { totalDocs } = await payload.find({
    collection: 'members',
    where: {
      community: { equals: communityId },
      status: { equals: 'active' },
    },
    limit: 0, // chỉ cần count
  });

  await payload.update({
    collection: 'communities',
    id: communityId,
    data: { memberCount: totalDocs },
  });

  return doc;
};

export const Members: CollectionConfig = {
  slug: 'members',
  labels: {
    singular: 'Thành viên cộng đồng',
    plural: 'Thành viên cộng đồng',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user, // sẽ giới hạn bằng hook hoặc role sau
  },
  fields: [
    {
      name: 'community',
      type: 'relationship',
      relationTo: 'communities',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'role',
      type: 'select',
      options: ['member', 'moderator', 'admin'],
      defaultValue: 'member',
    },
    {
      name: 'status',
      type: 'select',
      options: ['active', 'banned', 'pending'],
      defaultValue: 'pending', // nên là pending, admin duyệt sau hoặc tự động active khi join public
    },
    {
      name: 'joinedAt',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
  indexes: [
    {
      fields: ['community', 'user'],
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          return {
            ...data,
            joinedAt: new Date().toISOString(),
          };
        }
        return data;
      },
    ],
    afterChange: [updateCommunityMemberCount],
    afterDelete: [updateCommunityMemberCount], // quan trọng: khi xóa thành viên cũng phải cập nhật count
  },
};