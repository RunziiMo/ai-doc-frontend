import axios from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { getToken } from '@/utils/auth'
import type { HttpResponse } from './types'
import { ElMessage } from 'element-plus'

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      if (!config.headers) {
        config.headers = undefined
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // do something
    return Promise.reject(error)
  },
)

const onFulfilled = (
  response: AxiosResponse<HttpResponse>,
):
  | AxiosResponse<HttpResponse, HttpResponse>
  | Promise<AxiosResponse<HttpResponse, HttpResponse>> => {
  const res = response.data
  const type = response.config.responseType
  if (type === 'blob') {
    return response
  }
  const { errcode, message } = res
  if (errcode !== 0) {
    ElMessage.error({
      message,
    })
  }
  return response
}
const onRejected = (error: any): Promise<any> => {
  const errMsg = error.message || 'Error'
  ElMessage.error(errMsg)
  return Promise.reject(error)
}
// add response interceptors
axios.interceptors.response.use(onFulfilled, onRejected)
