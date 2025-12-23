import { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const Provinces: CollectionConfig = {
  slug: 'provinces',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['code', 'name', 'division_type'],
  },
  defaultPopulate:{
    name:true,
    division_type:true,
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
      label: 'Mã tỉnh / thành phố',
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên tỉnh / thành phố',
    },
    {
      name: 'codename',
      type: 'text',
      required: true,
      label: 'Slug / Tên mã hóa',
      admin: {
        description: 'Dạng slug, ví dụ: thanh_pho_ho_chi_minh',
      },
    },
    {
      name: 'division_type',
      type: 'select',
      label: 'Loại đơn vị hành chính',
      required: true,
      options: [
        { label: 'Tỉnh', value: 'tinh' },
        { label: 'Thành phố', value: 'thanh_pho' },
        { label: 'Thành phố trực thuộc trung ương', value: 'thanh_pho_truc_thuoc_trung_uong' },
      ],
      defaultValue: 'tinh',
    },
  ],
}
