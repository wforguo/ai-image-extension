import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { dayjs } from 'element-plus'
// Vue等api自动导入
import AutoImport from 'unplugin-auto-import/vite'
// 组件自动导入
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// 对于Message等样式自动导入
import { createStyleImportPlugin, ElementPlusResolve } from 'vite-plugin-style-import'

import hotReloadBackground from './scripts/hot-reload/background'
import { __DEV__ } from './const'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version: APP_VERSION } = require('./package.json')

export const r = (...args: string[]) => resolve(__dirname, '.', ...args)

export const commonConfig = {
    base: '/',
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    plugins: [vue(), vueJsx()]
}

// https://vitejs.dev/config/
export default (configEnv: any) => {
    const { mode } = configEnv
    const env = loadEnv(mode, process.cwd())
    // 增加环境变量
    env.APP_VERSION = APP_VERSION
    env.APP_BUILD_TIME = dayjs().format('YYYY-MM-DD HH:mm:ss')

    return defineConfig({
        ...commonConfig,
        define: {
            'process.env': JSON.stringify({
                ...env
            })
        },
        build: {
            watch: {},
            cssCodeSplit: false,
            emptyOutDir: false,
            sourcemap: __DEV__,
            outDir: r('local'),
            rollupOptions: {
                input: {
                    background: r('src/background/index.ts'),
                    popup: r('src/popup/index.ts')
                },
                output: {
                    assetFileNames: '[name].[ext]',
                    entryFileNames: '[name]/index.js',
                    extend: true,
                    format: 'es'
                }
            }
        },
        plugins: [
            ...commonConfig.plugins,
            // 【自动引入配置】https://juejin.cn/post/7012446423367024676#heading-0
            AutoImport({
                imports: ['vue'],
                dts: 'src/auto-imports.d.ts',
                resolvers: [ElementPlusResolver()]
            }),
            Components({
                // 指定组件位置，默认是src/components
                dirs: ['src/components'],
                // 配置文件生成位置
                dts: 'src/components.d.ts',
                // 自定义组件的解析器，ui库解析器
                resolvers: [ElementPlusResolver()]
            }),
            createStyleImportPlugin({
                resolves: [ElementPlusResolve()]
            }),
            hotReloadBackground()
        ],
        // 引用使用less的库要配置一下
        css: {
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true
                }
            }
        }
    })
}
