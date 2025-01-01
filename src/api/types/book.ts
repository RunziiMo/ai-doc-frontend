export interface DocumentTreeAAttr {
  is_open?: boolean
  opened?: number
}
export interface DocumentTree {
  id?: number
  text?: string
  parent?: string
  identify?: string
  version?: number
  a_attr?: DocumentTreeAAttr
}
export interface BookInfo {
  book_id?: number
  book_name?: string
  item_id?: number
  item_name?: string
  identify?: string
  order_index?: number
  description?: string
  aigc_function?: string
  publisher?: string
  privately_owned?: number
  private_token?: string
  book_password?: string
  doc_count?: number
  comment_status?: string
  comment_count?: number
  create_time?: string
  create_name?: string
  real_name?: string
  modify_time?: string
  cover?: string
  theme?: string
  label?: string
  member_id?: number
  editor?: string
  auto_release?: boolean
  history_count?: number
  role_id?: number
  role_name?: string
  status?: number
  is_enable_share?: boolean
  is_use_first_document?: boolean
  last_modify_text?: string
  is_display_comment?: boolean
  is_download?: boolean
  auto_save?: boolean
  Lang?: string
  document_trees?: DocumentTree[]
}
