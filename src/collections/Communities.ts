// collections/communities.ts
import { adminOnly } from '@/access/adminOnly';
import { adminOrLogin } from '@/access/adminOrLogin';
import { adminOrSelf } from '@/access/adminOrSelf';
import { CollectionConfig } from 'payload';

export const Communities: CollectionConfig = {
  slug: 'communities',
  labels: { singular: 'Cộng đồng', plural: 'Cộng đồng' },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: adminOrLogin,
    update: adminOrSelf, // bạn sẽ thêm field owner sau, hoặc dùng hook
    delete: adminOnly,
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Chỉ dùng chữ thường, số và dấu gạch ngang (-)',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'memberCount',
      type: 'number',
      defaultValue: 1, // vì người tạo tự động là thành viên
      admin: { readOnly: true },
    },
  ],
  endpoints: [
    // 1. Cộng đồng của bạn (đã tham gia - status: active)
    {
      path: '/joined',
      method: 'get',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ message: 'Yêu cầu đăng nhập' }, { status: 401 });
        }

        try {
          // Bước 1: Tìm tất cả bản ghi members của user hiện tại với status active
          const memberRecords = await req.payload.find({
            collection: 'members',
            where: {
              user: { equals: req.user.id },
              status: { equals: 'active' },
            },
            depth: 1, // populate community
            pagination: false,
          });

          // Bước 2: Lấy danh sách community IDs
          const communityIds = memberRecords.docs
            .map((doc: any) => doc.community?.id || doc.community)
            .filter(Boolean);

          if (communityIds.length === 0) {
            return Response.json({ docs: [], totalDocs: 0, page: 1, totalPages: 1 });
          }

          // Bước 3: Query communities theo list IDs
          const result = await req.payload.find({
            collection: 'communities',
            where: {
              id: { in: communityIds },
            },
            depth: 3,
            sort: '-memberCount',
            limit: 50,
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            req,
          });

          return Response.json(result);
        } catch (error) {
          console.error('Error in /joined:', error);
          return Response.json({ message: 'Lỗi server' }, { status: 500 });
        }
      },
    },

    // 2. Cộng đồng bạn quản lý (là owner HOẶC role admin trong members)
    {
      path: '/managed',
      method: 'get',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ message: 'Yêu cầu đăng nhập' }, { status: 401 });
        }

        try {
          // Trường hợp 1: Là owner
          const ownedCommunities = await req.payload.find({
            collection: 'communities',
            where: { owner: { equals: req.user.id } },
            depth: 3,
          });

          // Trường hợp 2: Là admin trong members
          const adminMemberRecords = await req.payload.find({
            collection: 'members',
            where: {
              user: { equals: req.user.id },
              role: { equals: 'admin' },
            },
            depth: 1,
          });

          const adminCommunityIds = adminMemberRecords.docs
            .map((doc: any) => doc.community?.id || doc.community)
            .filter(Boolean);

          let allCommunityIds = [
            ...ownedCommunities.docs.map((doc: any) => doc.id),
            ...adminCommunityIds,
          ];

          // Loại trùng
          allCommunityIds = [...new Set(allCommunityIds)];

          if (allCommunityIds.length === 0) {
            return Response.json({ docs: [], totalDocs: 0 });
          }

          const result = await req.payload.find({
            collection: 'communities',
            where: { id: { in: allCommunityIds } },
            depth: 3,
            sort: '-createdAt',
            req,
          });

          return Response.json(result);
        } catch (error) {
          console.error('Error in /managed:', error);
          return Response.json({ message: 'Lỗi server' }, { status: 500 });
        }
      },
    },

    // 3. Cộng đồng gợi ý (user chưa từng tham gia - không có bản ghi trong members)
    {
      path: '/suggested',
      method: 'get',
      handler: async (req) => {
        try {
          let excludedCommunityIds: string[] = [];

          if (req.user) {
            // Lấy tất cả community mà user đã có bản ghi member (bất kể status)
            const userMemberships = await req.payload.find({
              collection: 'members',
              where: { user: { equals: req.user.id } },
              pagination: false,
            });

            excludedCommunityIds = userMemberships.docs
              .map((doc: any) => doc.community?.id || doc.community)
              .filter(Boolean);
          }

          const where: any = excludedCommunityIds.length > 0
            ? { id: { not_in: excludedCommunityIds } }
            : {};

          const result = await req.payload.find({
            collection: 'communities',
            where,
            depth: 3,
            limit: 20,
            sort: '-memberCount', // cộng đồng đông thành viên trước
            req,
          });

          return Response.json(result);
        } catch (error) {
          console.error('Error in /suggested:', error);
          return Response.json({ message: 'Lỗi server' }, { status: 500 });
        }
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Chỉ chạy khi tạo mới cộng đồng
        if (operation !== 'create') return doc;

        const payload = req.payload;
        const userId = req.user?.id;
        const communityId = doc.id;

        if (!userId || !communityId) {
          console.error('Missing user or community ID in community creation hook');
          return doc;
        }

        try {
          // Kiểm tra xem đã có bản ghi member cho owner chưa (tránh duplicate)
          const existingMember = await payload.find({
            collection: 'members',
            where: {
              community: { equals: communityId },
              user: { equals: userId },
            },
            limit: 1,
            pagination: false,
          });

          if (existingMember.docs.length > 0) {
            // Đã tồn tại (có thể do retry hoặc lỗi trước đó)
            return doc;
          }

          // Tạo bản ghi member với role admin và status active
          await payload.create({
            collection: 'members',
            data: {
              community: communityId,
              user: userId,
              role: 'admin',
              status: 'active',
              joinedAt: new Date().toISOString(),
            },
            req, // truyền req để có context (user, locale, v.v.)
          });

          console.log(`Auto-added owner ${userId} as admin to community ${communityId}`);
        } catch (error: any) {
          // Không throw error để không block việc tạo community
          console.error('Failed to auto-add owner as admin member:', error);
          // Có thể gửi notification hoặc log chi tiết hơn
        }

        return doc;
      },
    ],
  },
};