# @cohook/core

框架无关、轻量级、渐进式的不可变数据管理方案

## ✨特性
+ 读写分离，自定义Action去处理数据，灵活化组装实现逻辑复用
+ 轻量，API简单化，类型提示友好
+ 数据不可变
+ 支持插件化拓展功能

## 📦 安装
```sh
yarn add @cohook/core
```

```sh
npm i @cohook/core
```

## 💡API

### ```createContainer(initialData [, pluginsOption])```
createContainer作为容器工厂函数，接收初始数据`initialData`和可选的插件配置[`pluginsOption`](#pluginsoption)，返回一个容器对象[`container`](#container)。

#### `pluginsOption`
插件配置是一个对象，`key`为插件名，`value`为插件方法具体实现。

⚠️ 为了插件的更简便实现，改写了插件方法的[`this`](#this)参数，因此插件方法不能用[箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)

- #### `this: PluginContext<T>`

| 属性 | 说明 | 类型`(T为容器数据的类型)` |
| -- | -- | -- |
| `getData` | 容器对象`container`的getData方法 | () => T |
| `commit` | 容器对象`container`的commit方法 | (updater: [Updater<T>](https://github.com/Keylenn/cohookjs/blob/cohook-core/packages/cohook-core/src/types/index.ts#L6)) => T |
| `tryToTrackEffect` | 追踪对应的数据，注入副作用钩子`effectHook` | (option: [TrackOption<T>](https://github.com/Keylenn/cohookjs/blob/cohook-core/packages/cohook-core/src/types/index.ts#L55))) => { trackId: number } \| null |
| `cleanUpEffect` | 清除副作用钩子 | (trackId: number) => void |

🌰
+ loggerPlugin
```ts
function loggerPlugin() {
  this.tryToTrackEffect({
    effectHook: (option) => {
      logToMyService(option)
    }
  })
}
```

+ [useMapDataToStatePlugin](https://github.com/Keylenn/cohookjs/blob/cohook-react/packages/cohook-react/src/core/hooks/useMapDataToStatePlugin.ts)

#### `container`

##### ```container.getData()```
用于获取当前的容器数据，就像是一个内置的action，可在任何地方使用。


##### ```container.commit(updater)```
commit 接受一个函数updater（immer中的[produce](https://immerjs.github.io/immer/produce)的第二个参数保持一致）作为参数，用来创建修改数据的Action，可灵活组合容器对象提供的方法来组装Action。

```tsx
const dec = () => {
  const count = container.getData()
  if(count < 0) return
  container.commit((draft) => void (draft.current -= 1)
}
```