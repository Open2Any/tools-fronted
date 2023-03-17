/*
 * @Description: 
 * @Author: Devin
 * @Date: 2023-03-16 18:14:59
 */
import type { ProxyOptions } from 'vite'

export function createViteProxy(isOpenProxy: boolean, viteEnv: ImportMetaEnv) {
  if (!isOpenProxy)
    return

  const proxy: Record<string, string | ProxyOptions> = {
    '/tools': {
      target: viteEnv.VITE_APP_API_BASE_URL,
      changeOrigin: true,
      rewrite: path => path.replace('/tools/', '/'),
    },
  }

  return proxy
}
