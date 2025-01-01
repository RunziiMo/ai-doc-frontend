import axios from 'axios'
import type { Entity, HttpResponse, PageList, PageWrap } from '../types'
import { objToFormData } from '@/utils/basic'
export default class EntityApi {
  /**
   * 获取实体列表
   */
  static getList = (docId: string) => {
    return axios.get<HttpResponse<PageWrap<PageList<Entity>>>>(`/api/document/${docId}/entity`)
  }
  /**
   * 新增实体
   */
  static add = (params: Partial<Entity & { entityList: Entity[] }>) => {
    const docId = params.document_id
    delete params.document_id
    delete params.entityList
    return axios.post(`/api/document/${docId}/entity`, params)
  }
  /**
   * 编辑实体
   */
  static edit = (params: Partial<Entity>) => {
    const form = objToFormData(params)
    return axios.put(`/api/document/${params.document_id}/entity/${params.entity_id}`, form)
  }
  /**
   * 删除实体
   */
  static delete = (params: Partial<Entity>) => {
    return axios.delete(
      `/api/document/${params.document_id}/entity?&type=${params.type}&text=${encodeURIComponent(params.replaced_text)}`,
    )
  }
  /**
   * nerUpdate
   */
  static nerUpdate = (params: { book_identify: string; doc_id: number }) => {
    const form = objToFormData(params)
    return axios.post<HttpResponse<PageWrap<PageList<Entity>>>>(`/aigc/ner_update`, form)
  }
}
