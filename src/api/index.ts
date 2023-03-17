/*
 * @Description: 
 * @Author: Devin
 * @Date: 2023-03-16 18:14:59
 */
import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/tools-chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/tools-config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  return post<T>({
    url: '/tools-process',
    data: { prompt: params.prompt, options: params.options },
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

export function fetchSession<T>() {
  return post<T>({
    url: '/tools-session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/tools-verify',
    data: { token },
  })
}
