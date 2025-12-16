import { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const PropertyTypes: CollectionConfig = {
  slug: 'property_type',
  labels: { singular: 'Loại bất động sản', plural: 'Các loại bất động sản' },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'slug', 'is_active'],
  },
  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Tên loại bất động sản',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      label: 'Slug (ví dụ: apartment, house, land...)',
    },
    {
      name:'value',
      type:'text',
      required:true,
      label:'Giá trị'
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả loại bất động sản',
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Icon hiển thị (tùy chọn)',
    },
    {
      name: 'is_active',
      type: 'checkbox',
      label: 'Hiển thị loại này',
      defaultValue: true,
    },
  ],
}
