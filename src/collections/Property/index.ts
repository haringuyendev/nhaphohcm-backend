import { CollectionConfig, slugField } from 'payload'
import {
  lexicalEditor,
  HeadingFeature,
  InlineToolbarFeature,
  HorizontalRuleFeature,
  FixedToolbarFeature,
} from '@payloadcms/richtext-lexical'
import { adminOrSelf } from '@/access/adminOrSelf'
import { adminOnly } from '@/access/adminOnly'
import { autoAssignSeller } from './hooks/autoAssignSeller'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

const updateWardPropertyCount = async ({ req, ward_id }: { req: any; ward_id: string }) => {
  const payload = req.payload
  try {
    const count = await payload.count({
      collection: 'properties',
      where: {
        'ward.id': { equals: ward_id },
        is_published: { equals: true },
      },
    })
    console.log(count)
    await payload.update({
      collection: 'wards',
      where: { id: { equals: ward_id } },
      data: { propertyCount: count.totalDocs },
    })
  } catch (error) {
    console.error(`[updateWardPropertyCount] Ward ${ward_id}:`, error)
  }
}
export const Properties: CollectionConfig = {
  slug: 'properties',
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'price',
      'area',
      'type',
      'province',
      'district',
      'is_published',
      'is_vip',
    ],
  },
  access: {
    read: () => true,
    create: adminOrSelf, // chỉ user đăng nhập hoặc admin mới được tạo
    update: adminOrSelf, // chỉ chủ tin hoặc admin mới được sửa
    delete: adminOnly, // chỉ admin được xóa
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Tiêu đề tin đăng',
            },
            {
              name: 'type',
              type: 'relationship',
              relationTo: 'property_type',
              required: true,
              label: 'Loại bất động sản',
            },
            {
              name: 'price',
              type: 'number',
              label: 'Giá (VNĐ)',
              required: true,
            },
            {
              name: 'area',
              type: 'number',
              label: 'Diện tích (m²)',
              required: true,
            },
            {
              name: 'bedrooms',
              type: 'number',
              label: 'Số phòng ngủ',
            },
            {
              name: 'bathrooms',
              type: 'number',
              label: 'Số phòng tắm',
            },
            {
              name: 'address',
              type: 'text',
              label: 'Địa chỉ chi tiết',
              required: true,
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Mô tả chi tiết',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3'] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                  HorizontalRuleFeature(),
                ],
              }),
            },

            // 🖼️ Hình ảnh
            {
              name: 'images',
              type: 'array',
              label: 'Hình ảnh',
              minRows: 1,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },

            // 🌆 Vị trí hành chính
            {
              name: 'province',
              type: 'relationship',
              relationTo: 'provinces',
              required: true,
              label: 'Tỉnh / Thành phố',
            },
            {
              name: 'district',
              type: 'relationship',
              relationTo: 'districts',
              required: true,
              label: 'Quận / Huyện',
            },
            {
              name: 'ward',
              type: 'relationship',
              relationTo: 'wards',
              label: 'Phường / Xã',
              // BẮT BUỘC: chỉ hiển thị khi district đã chọn
              admin: {
                condition: (data) => !!data.district,
              },
              hooks: {
                afterChange: [
                  async ({ value, previousValue, req }) => {
                    try {
                      console.log(value, previousValue)
                      await updateWardPropertyCount({ req, ward_id: value })
                      await updateWardPropertyCount({ req, ward_id: previousValue })
                    } catch (error) {
                      console.error('[Property ward afterChange] Error:', error)
                    }
                  },
                ],
              },
              // CHỌN CHỈ CÁC WARDS CÓ district.code = data.district.code
              filterOptions: ({ data }) => {
                if (!data?.district) return false // ẩn field nếu chưa chọn district

                return {
                  district: {
                    equals: data.district, // LẤY CODE TỪ RELATIONSHIP
                  },
                }
              },
            },

            // ⭐ Trạng thái tin đăng
            {
              name: 'featured',
              type: 'checkbox',
              label: 'Tin nổi bật',
              defaultValue: false,
            },
            {
              name: 'is_published',
              type: 'checkbox',
              label: 'Đã hiển thị',
              defaultValue: true,
            },
            {
              name: 'is_hidden',
              type: 'checkbox',
              label: 'Ẩn tin đăng',
              defaultValue: false,
            },

            // 💎 VIP
            {
              name: 'is_vip',
              type: 'checkbox',
              label: 'Tin VIP',
              defaultValue: false,
            },
            {
              name: 'vip_activated_at',
              type: 'date',
              label: 'Ngày kích hoạt VIP',
              admin: { position: 'sidebar' },
            },
            {
              name: 'vip_expire_at',
              type: 'date',
              label: 'Ngày hết hạn VIP',
              admin: { position: 'sidebar' },
            },

            // 🕓 Metadata
            {
              name: 'created_at',
              type: 'date',
              label: 'Ngày đăng',
              admin: { readOnly: true, position: 'sidebar' },
            },
            {
              name: 'expire_at',
              type: 'date',
              label: 'Ngày hết hạn tin',
              admin: { position: 'sidebar' },
            },
            {
              name: 'bumped_at',
              type: 'date',
              label: 'Ngày đẩy tin',
              admin: { position: 'sidebar' },
            },
            {
              name: 'last_bumped_at',
              type: 'date',
              label: 'Đẩy tin gần nhất',
              admin: { position: 'sidebar' },
            },

            // 👤 Người đăng tin (seller = editor)
            {
              name: 'seller',
              type: 'relationship',
              relationTo: 'users',
              required: true,
              label: 'Người đăng tin',
              admin: {
                position: 'sidebar',
                readOnly: true,
                description: 'Tự động gán theo user đang đăng nhập',
              },
            },

            slugField(),
          ],
          label: 'Chi tiết tin đăng',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    // 🏷️ Thông tin cơ bản
  ],

  hooks: {
    beforeChange: [autoAssignSeller],
  },
}
