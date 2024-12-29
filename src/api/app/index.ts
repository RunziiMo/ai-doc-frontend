import axios from 'axios'
import type { BookInfo, HttpResponse } from '../types'
import type { DocumentInfo } from '../types/document-info'
export default class AppApi {
  /**
   * 获取图书信息
   */
  static getBook = (params: { identify: string }) => {
    return axios.get<HttpResponse<BookInfo>>(`/api/book/${params.identify}`, { params })
  }
  /**
   * 获取文章信息
   */
  static getDocument = (params: { identify: string; docId: number }) => {
    return axios.get<HttpResponse<DocumentInfo>>(`/api/${params.identify}/content/${params.docId}`)
  }
}
