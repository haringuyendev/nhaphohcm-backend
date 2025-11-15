import type { Block } from 'payload'

export const PropertyListBlock: Block = {
  slug: 'property-list',
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'list',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'List', value: 'list' },
      ],
      required: true,
    },
    
  ],
  interfaceName: 'PropertyListBlock',
}
