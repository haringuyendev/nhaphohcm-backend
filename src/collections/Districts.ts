import { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const Districts: CollectionConfig = {
  slug: 'districts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['code', 'name', 'division_type', 'province'],
  },
  defaultPopulate:{
    name:true,
    code:true,
    id:true
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
      label: 'Mã quận / huyện',
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên quận / huyện',
    },
    {
      name: 'codename',
      type: 'text',
      required: true,
      label: 'Tên mã hóa (slug)',
      admin: {
        description: 'Ví dụ: quan_binh_thanh',
      },
    },
    {
      name: 'division_type',
      type: 'select',
      label: 'Loại đơn vị hành chính',
      required: true,
      options: [
        { label: 'Quận', value: 'quan' },
        { label: 'Huyện', value: 'huyen' },
        { label: 'Thị xã', value: 'thi_xa' },
        { label: 'Thành phố', value: 'thanh_pho' },
      ],
    },
    {
      name: 'province',
      type: 'relationship',
      relationTo: 'provinces',
      label: 'Thuộc tỉnh / thành phố',
      required: true,
      admin: {
        description: 'Chọn tỉnh / thành phố mà quận / huyện này thuộc về',
      },
    },
  ],
}
