import { Block } from 'payload'

export const ButtonBlock: Block = {
  slug: 'button-block',
  labels: {
    singular: 'Button Block',
    plural: 'Button Blocks',
  },
  fields: [
    {
      name: 'buttons',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'relationship',
          relationTo: 'media',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Button Title',
        },
        
        {
          name: 'link',
          type: 'text',
          label: 'Link URL',
          required: false,
        },
      ],
    },
  ],
}
