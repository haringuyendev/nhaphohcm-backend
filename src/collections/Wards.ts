import { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const Wards: CollectionConfig = {
  slug: 'wards',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['code', 'name', 'division_type', 'district'],
  },
  defaultPopulate:{
    id:true,
    name:true,
    code:true,
  },
  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'code',
      type: 'number',
      required: true,
      unique: true,
      label: 'Mã phường / xã',
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên phường / xã',
    },
    {
      name: 'codename',
      type: 'text',
      required: true,
      label: 'Tên mã hóa (slug)',
      admin: {
        description: 'Ví dụ: phường_binh_thanh',
      },
    },
    {
      name: 'division_type',
      type: 'select',
      label: 'Loại đơn vị hành chính',
      required: true,
      options: [
        { label: 'Phường', value: 'phuong' },
        { label: 'Xã', value: 'xa' },
      ],
    },
    {
      name: 'district',
      type: 'relationship',
      relationTo: 'districts',
      label: 'Thuộc quận / huyện',
      required: true,
      admin: {
        description: 'Chọn quận / huyện mà phường / xã này thuộc về',
      },
    },
    {
      name: 'propertyCount',
      type: 'number',
      required: false,
      admin: { readOnly: true },
      defaultValue: 0,
    },
  ],
}
