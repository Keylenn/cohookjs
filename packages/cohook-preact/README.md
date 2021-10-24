# @cohook/preact

preact 轻量级、渐进式数据缓存和跨组件通信方案

## ✨特性
+ 支持数据缓存和共享
+ 支持数据状态化，自动跟踪变化并更新，精准定位作用区间
+ 读写分离，自定义Action去处理数据，灵活化组装实现逻辑复用
+ 轻量，API简单化，类型提示友好
+ 数据不可变
+ 支持插件化拓展功能

## 📦 安装
```sh
yarn add @cohook/preact
```

```sh
npm i @cohook/preact
```

## ⚡快速开始

#### 1. 定义一个Container
```tsx
import createContainer from "@cohook/preact"

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
  const count = container.useMapDataToState()
  return (
    <div>
      count:{count}
      <button onClick={inc}>+</button>
      <button onClick={dec}>-</button>
    </div>
  )
}
```

## 💡API

### ```createContainer(initialData [, option])```
createContainer作为容器工厂函数，接收初始数据`initialData`和可选的插件和共享等配置[`option 👉`](https://github.com/Keylenn/cohookjs/blob/master/packages/cohook-core/README.md#createcontainerinitialdata--option)，返回一个容器对象[`container`](#container)。

#### `container`

##### ```container.getData()```
用于获取当前的容器数据，就像是一个内置的action，可在任何地方使用。

##### ```container.useMapDataToState(...overloads)```
用于将数据状态化，被状态化后的数据会自动跟踪变化并更新。

+ ```const state = container.useMapDataToState()```
  <p style="margin-bottom: .5em;"></p>

  + 不带参数，直接将data状态化，
  + 容器内任意数据变化时直接更新


+ ```const derivedState = container.useMapDataToState(mapStateFn)```
  <p style="margin-bottom: .5em;"></p>

  + mapStateFn以data作为参数，可自定义返回的需要状态化的数据
  + 容器内对应状态化数据变化时才会更新，精准定位更新区间


#### ```container.commit(updater)```
commit 接受一个函数updater（immer中的[produce](https://immerjs.github.io/immer/produce)的第二个参数保持一致）作为参数，用来创建修改数据的Action，可灵活组合容器对象提供的方法来组装Action。
```tsx
/**
 * 1️⃣ Action
 */
const dec = () => {
  const count = container.getData()
  if(count < 0) return
  container.commit((draft) => void (draft.current -= 1)
}

/**
 * 2️⃣ Custom Hooks
 */
function useFilter() {
  const  visibilityFilter = todosContainer.useMapDataToState(data => data.filter)
  const setFilter = (filter: VisibilityFilters) => {
    todosContainer.commit((draft) => {
      draft.current.filter = filter
    })
  }
  
  return {
    filter: visibilityFilter,
    setFilter
  }
}

```