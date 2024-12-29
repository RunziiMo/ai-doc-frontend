export interface HttpResponse<T = unknown> {
  data: T
  errcode: number
  message: string
}

export interface PageList<T = unknown> {
  PageNo: number
  PageSize: number
  TotalPage: number
  TotalCount: number
  FirstPage: boolean
  LastPage: boolean
  List: T[]
}

export interface PageWrap<T = unknown> {
  doc_id: number
  page: T
}
