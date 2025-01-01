export interface Entity {
  entity_id?: number
  book_id?: number
  document_id?: number
  author?: string
  member_id?: number
  date?: string
  type?: string
  start_index?: number
  end_index?: number
  window_text?: string
  replaced_text?: string
  confidence?: number
  index?: number
  show_del?: number
}
