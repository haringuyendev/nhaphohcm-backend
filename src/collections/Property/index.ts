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
import { generateUniqueSlug } from './hooks/generateUniqueSlug'
import { autoSetExpireDate } from './hooks/autoSetExprireDate'
import { autoAssignBumpedAt } from './hooks/autoAssignBumpedAt'
import { title } from 'process'

// src/collections/Property/hooks/updateWardCount.ts
const updateWardPropertyCount = async ({
  req,
  ward,
}: {
  req: any
  ward: { id: string } | null | undefined
}) => {
  // SIÊU QUAN TRỌNG: KIỂM TRA NULL/UNDEFINED TRƯỚC KHI DÙNG
  if (!ward || !ward.id) {
    return
  }

  const payload = req.payload
  const ward_id = ward.id

  try {
    const count = await payload.count({
      collection: 'properties',
      where: {
        'ward.id': { equals: ward_id },
        is_published: { equals: true },
      },
    })

    await payload.update({
      collection: 'wards',
      id: ward_id,
      data: { propertyCount: count.totalDocs },
    })
  } catch (error) {}
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
  defaultPopulate: {
    title: true,
    description: true,
    images: true,
    type: true,
    province: true,
    district: true,
    ward: true,
    seller: true,
    is_published: true,
    is_vip: true,
    featured: true,
    address: true,
    price: true,
    area: true,
    bedrooms: true,
    bathrooms: true,
    expire_at: true,
    vip_expire_at: true,
    is_hidden: true,
    bumped_at: true,
    slug: true,
  },
  access: {
    read: () => true,
    create: adminOrSelf, // chỉ user đăng nhập hoặc admin mới được tạo
    update: async ({ req, id }) => {
      const user = req.user
      if (!user) return false

      // Admin toàn quyền
      if (user.roles?.includes('admin')) return true

      // Nếu không phải admin → chỉ được sửa tin của chính mình
      try {
        const property = await req.payload.findByID({
          collection: 'properties',
          id: id as string,
          depth: 1, // không cần populate sâu
        })

        // So sánh seller.id với user.id
        return (property.seller as any)?.id === user.id
      } catch (error) {
        return false // lỗi → từ chối
      }
    },
    delete: async ({ req, id }) => {
      const user = req.user
      if (!user) return false

      // Admin toàn quyền
      if (user.roles?.includes('admin')) return true

      // Nếu không phải admin → chỉ được sửa tin của chính mình
      try {
        const property = await req.payload.findByID({
          collection: 'properties',
          id: id as string,
          depth: 1, // không cần populate sâu
        })

        // So sánh seller.id với user.id
        return (property.seller as any)?.id === user.id
      } catch (error) {
        return false // lỗi → từ chối
      }
    }, // chỉ admin được xóa
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
              // validate: () => true,
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
                      // Cập nhật cho ward mới (nếu có)
                      if (value) {
                        await updateWardPropertyCount({ req, ward: value as { id: string } })
                      }

                      // Cập nhật cho ward cũ (nếu bị xóa hoặc thay đổi)
                      if (previousValue) {
                        await updateWardPropertyCount({
                          req,
                          ward: previousValue as { id: string },
                        })
                      }
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
            {
              name: 'slug',
              type: 'text',
              label: 'Slug (URL)',
              unique: true,
              index: true,
              admin: {
                position: 'sidebar',
                readOnly: true, // người dùng không sửa được
                description: 'Tự động tạo từ tiêu đề, nếu trùng sẽ thêm -1, -2...',
              },
            },
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
  endpoints: [
    {
      path: '/similar/:id',
      method: 'get',
      handler: async (req: any) => {
        const { id } = req.routeParams || req.params
        if (!id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        const current = await req.payload.findByID({
          collection: 'properties',
          id,
        })

        const similar = await req.payload.find({
          collection: 'properties',
          where: {
            and: [
              { id: { not_equals: id } },
              { type: { equals: current.type } },
              { province: { equals: current.province } }, // hoặc district nếu chi tiết hơn
              // { status: { equals: 'published' } },
            ],
          },
          limit: 10,
          depth: 2,
          sort: '-createdAt',
        })
        return Response.json({ docs: similar.docs })
      },
    },
  ],
  hooks: {
    beforeChange: [autoAssignSeller, generateUniqueSlug, autoSetExpireDate, autoAssignBumpedAt],
  },
}
