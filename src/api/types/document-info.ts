export interface DocumentInfo {
  doc_id?: number
  doc_name?: string
  identify?: string
  book_id?: number
  parent_id?: number
  order_sort?: number
  markdown?: string
  markdown_theme?: string
  release?: string
  content?: string
  create_time?: string
  member_id?: number
  modify_time?: string
  version?: number
  is_open?: number
  view_count?: number
  attach?: Record<string, unknown>[]
  Lang?: string
}
