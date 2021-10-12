# `@cohook/solid-js`

Solid JS 轻量级、渐进式数据缓存和跨组件通信方案


## ✨特性
+ 基于solidJS内置的数据管理方案封装
+ 自动跟踪数据变化并更新，精准定位作用区间
+ 读写分离，自定义Action去处理数据，灵活化组装实现逻辑复用
+ 轻量，API简单化，类型提示友好
+ 数据不可变
+ 支持插件化拓展功能

## 📦 安装
```sh
yarn add @cohook/solid-js
```

```sh
npm i @cohook/solid-js
```

## ⚡快速开始

#### 1. 定义一个Container
```tsx
import createContainer from "@cohook/solid-js"

const container = createContainer(0)
```
#### 2. 定义Action
```tsx
const inc = () => container.commit((draft) => void (draft.current += 1)
const dec = () => container.commit((draft) => void (draft.current -= 1)
```


#### 3. 数据状态化和修改

```tsx
function Counter() {
  const countAccessor = counterContainer.useMapDataToAccessor()
  return (
    <div>
      count:{countAccessor()}
      <button onClick={() => inc()}>+</button>
      <button onClick={() => dec()}>-</button>
    </div>
  )
}
```

## 💡API

### ```createContainer(initialData)```
createContainer作为容器工厂函数，接收初始数据`initialData`，返回一个容器对象[`container`](#container)。
#### `container`

##### ```container.useMapDataToAccessor()```
用于将数据状态化，被状态化后的数据会自动跟踪变化并更新。

##### ```container.commit(updater)```
commit 接受一个函数updater（和SolidJS的[produce](https://www.solidjs.com/docs/latest#produce)的参数基本保持一致）作为参数，,用来创建修改数据的Action，可灵活组合容器对象提供的方法来组装Action。

```js
const dec = () => container.commit((draft) => void (draft.current -= 1)
```

### ```createContainerWithPlugins(initialData, pluginsOption)```
createContainer作为容器工厂函数，接收初始数据`initialData`和插件配置[`pluginsOption 👉`](https://github.com/Keylenn/cohookjs/blob/master/packages/cohook-core/README.md#pluginsoption)，返回一个带有插件的容器对象[`containerWithPlugins`](#containerwithplugins)。

#### `containerWithPlugins`

##### ```containerWithPlugins.getData()```
用于获取当前的容器数据，就像是一个内置的action，可在任何地方使用。

##### ```containerWithPlugins.useMapDataToAccessor()```
用于将数据状态化，被状态化后的数据会自动跟踪变化并更新。

##### ```containerWithPlugins.commit(updater)```
commit 接受一个函数updater（和SolidJS的[produce](https://www.solidjs.com/docs/latest#produce)的参数基本保持一致）作为参数，,用来创建修改数据的Action，可灵活组合容器对象提供的方法来组装Action。

```js
const dec = () => {
  const count = containerWithPlugins.getData()
  if(count < 0) return
  containerWithPlugins.commit((draft) => void (draft.current -= 1)
}
```
