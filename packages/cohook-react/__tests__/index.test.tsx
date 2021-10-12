"use strict"

import React from "react"
import { render, fireEvent, getByTestId } from "@testing-library/react"
import createContainer from "../src"
import { ReactBase } from "../src/types"

interface Todo {
  id: number
  text: string
  completed: boolean
}

describe("nestedDataChange", () => {
  let todosContainer: ReactBase<Todo[]>
  let nextTodoId: number
  let addTodoActionRenderCount: number
  let todosRenderCount: number
  let firstTodoTextRenderCount: number

  const AddTodo = () => {
    addTodoActionRenderCount += 1
    const inputRef: any = React.useRef(null)
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!inputRef.current.value.trim()) {
            return
          }
          todosContainer.commit((draft: any) => {
            nextTodoId += 1
            draft.current.push({
              id: nextTodoId,
              text: inputRef.current.value,
              completed: false,
            })
          })
          inputRef.current.value = ""
        }}
      >
        <input data-testid="add-input" ref={inputRef} />
        <button type="submit" data-testid="add-btn">
          Add Todo
        </button>
      </form>
    )
  }

  const TodoList = () => {
    todosRenderCount += 1
    const todoList = todosContainer.useMapDataToState() as any[]
    return (
      <ul>
        {todoList.map((item: any, idx) => (
          <li
            key={item.id}
            data-testid={`li-${idx + 1}`}
            onClick={() => {
              const { id } = item
              todosContainer.commit((draft: any) => {
                draft.current = draft.current.map((todo: any) =>
                  todo.id === id
                    ? { ...todo, completed: !todo.completed }
                    : todo
                )
              })
            }}
            style={{
              textDecoration: item.completed ? "line-through" : "none",
            }}
            aria-hidden
          >
            {item.text}
          </li>
        ))}
      </ul>
    )
  }

  const FirstTodo = () => {
    firstTodoTextRenderCount += 1
    const firstTodo = todosContainer.useMapDataToState((data: any) => data[0])
    return <span>{firstTodo.text}</span>
  }

  const DataContainer = () => {
    const spanRef: any = React.useRef(null)
    return (
      <>
        <button
          data-testid="get-first-text-btn"
          onClick={() => {
            const firstTodoText = (todosContainer as any)?.getData()?.[0]?.text
            spanRef.current.innerHTML = firstTodoText
          }}
        >
          getFirstTodoText
        </button>
        <button
          data-testid="change-first-text-btn"
          onClick={() => {
            todosContainer.commit((draft: any) => {
              draft.current[0].text = "code"
            })
          }}
        >
          changeFirstTodoText
        </button>
        <span data-testid="first-todo-text" ref={spanRef} />
      </>
    )
  }

  const App = () => {
    return (
      <>
        <AddTodo />
        <TodoList />
        <FirstTodo />
        <DataContainer />
      </>
    )
  }

  beforeEach(() => {
    nextTodoId = 0
    addTodoActionRenderCount = 0
    todosRenderCount = 0
    firstTodoTextRenderCount = 0
    todosContainer = createContainer([
      {
        id: 0,
        text: "eat",
        completed: false,
      },
    ])
  })

  test("first render", () => {
    const { container } = render(<App />)
    expect(nextTodoId).toBe(0)
    expect(addTodoActionRenderCount).toBe(1)
    expect(todosRenderCount).toBe(1)
    expect(firstTodoTextRenderCount).toBe(1)
    expect(container.querySelectorAll("li").length).toBe(1)
    expect(getByTestId(container, "li-1").textContent).toBe("eat")
  })

  test("add todo", () => {
    const { container } = render(<App />)
    const input = getByTestId(container, "add-input") as HTMLInputElement
    input.value = "play"
    const addBtn = getByTestId(container, "add-btn")
    fireEvent.click(addBtn!)

    expect(nextTodoId).toBe(1)
    expect(addTodoActionRenderCount).toBe(1)
    expect(todosRenderCount).toBe(2)
    expect(firstTodoTextRenderCount).toBe(1)
    expect(container.querySelectorAll("li").length).toBe(2)
    expect(getByTestId(container, "li-2").textContent).toBe("play")
  })

  test("toggle todo", () => {
    const { container } = render(<App />)
    const li1 = getByTestId(container, "li-1")
    fireEvent.click(li1!)

    expect(addTodoActionRenderCount).toBe(1)
    expect(todosRenderCount).toBe(2)
    expect(firstTodoTextRenderCount).toBe(2)
    expect(container.querySelectorAll("li").length).toBe(1)
    expect(li1.style.textDecoration).toBe("line-through")
  })

  test("get first todo text", () => {
    const { container } = render(<App />)
    const getBtn = getByTestId(container, "get-first-text-btn")
    fireEvent.click(getBtn!)

    expect(addTodoActionRenderCount).toBe(1)
    expect(todosRenderCount).toBe(1)
    expect(firstTodoTextRenderCount).toBe(1)
    expect(container.querySelectorAll("li").length).toBe(1)
    expect(getByTestId(container, "first-todo-text").textContent).toBe("eat")
  })

  test("change first todo text", () => {
    const { container } = render(<App />)

    const changeBtn = getByTestId(container, "change-first-text-btn")
    fireEvent.click(changeBtn!)
    const getBtn = getByTestId(container, "get-first-text-btn")
    fireEvent.click(getBtn!)

    expect(addTodoActionRenderCount).toBe(1)
    expect(todosRenderCount).toBe(2)
    expect(firstTodoTextRenderCount).toBe(2)
    expect(container.querySelectorAll("li").length).toBe(1)
    expect(getByTestId(container, "first-todo-text").textContent).toBe("code")
  })
})
