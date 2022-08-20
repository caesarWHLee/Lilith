import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  select,
  timestamp,
  checkbox,
  json,
} from '@keystone-6/core/fields'

import config from '../config'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum Status {
  Published = 'published',
  Draft = 'draft',
  Scheduled = 'scheduled',
  Archived = 'archived',
}

enum EventStatus {
  Opening = 'opening',
  Closed = 'closed',
}

enum Type {
  SEInsight = 'seinsight',
  External = 'external',
}

const listConfigurations = list({
  fields: {
    name: text({
      label: '活動名稱',
      validation: {
        isRequired: true,
      },
    }),
    eventStatus: select({
      label: '活動狀態',
      type: 'enum',
      options: [
        { label: '即將舉辦（舉辦中）', value: EventStatus.Opening },
        { label: '過往活動', value: EventStatus.Closed },
      ],
      validation: {
        isRequired: true,
      },
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    status: select({
      label: '狀態',
      type: 'enum',
      options: [
        { label: '出版', value: Status.Published },
        { label: '草稿', value: Status.Draft },
        { label: '排程', value: Status.Scheduled },
        { label: '下架', value: Status.Archived },
      ],
      defaultValue: 'draft',
      ui: {
        displayMode: 'segmented-control',
        listView: {
          fieldMode: 'read',
        },
      },
      validation: {
        isRequired: true,
      },
    }),
    type: select({
      label: '類別',
      type: 'enum',
      options: [
        { label: '社企流', value: Type.SEInsight },
        { label: '外部活動', value: Type.External },
      ],
      validation: {
        isRequired: true,
      },
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    region: select({
      label: '地區',
      type: 'enum',
      options: config.region_options,
      validation: {
        isRequired: true,
      },
    }),
    section: relationship({
      label: '關注領域',
      ref: 'Section.events',
      ui: {
        displayMode: 'select',
        hideCreate: true,
        labelField: 'name',
      },
      many: false,
    }),
    heroImage: customFields.relationship({
      label: '活動首圖',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
      many: false,
    }),
    content: customFields.richTextEditor({
      label: '敘述',
    }),
    event_start: timestamp({
      label: '開始時間',
    }),
    event_end: timestamp({
      label: '結束時間',
    }),
    isTop: checkbox({
      label: '是否置頂（呈現於列表頁）',
    }),
    bannaerImage: customFields.relationship({
      label: 'Banner圖（呈現於列表頁）',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
      many: false,
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag.events',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    relatedEvents: relationship({
      label: '相關活動',
      ref: 'Event',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    // previewButton: virtual({
    //   field: graphql.field({
    //     type: graphql.String,
    //     resolve(item: Record<string, unknown>): string {
    //       return `/event/${item?.slug}`
    //     },
    //   }),
    //   ui: {
    //     views: require.resolve('./preview-button'),
    //   },
    // }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    resolveInput: ({ resolvedData }) => {
      const { content } = resolvedData
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }
      return resolvedData
    },
  },
})

export default utils.addTrackingFields(listConfigurations)