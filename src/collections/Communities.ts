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
};