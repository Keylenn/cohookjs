"use strict"

import createContainer from "../src"

describe("createContainer", () => {
  test("create base container", () => {
    const countContainer = createContainer(0)
    expect(countContainer.getData()).toBe(0)
    countContainer.commit((d) => {
      d.current += 1
    })
    expect(countContainer.getData()).toBe(1)
    const inc = (step = 1) => {
      countContainer.commit((d) => {
        d.current += step
      })
    }
    inc(10)
    expect(countContainer.getData()).toBe(11)
  })

  test("create container with plugins", () => {
    const logArr: any[] = []
    const initialData: number[] = []
    const countContainer = createContainer(initialData, {
      logger() {
        this.tryToTrackEffect({
          effectHook: (option) => {
            logArr.push(option)
          },
        })
      },
    })
    countContainer.plugins.logger()
    countContainer.commit((d) => {
      d.current.push(d.current.length + 1)
    })
    expect(countContainer.getData()[0]).toBe(1)
    const { changedPatches: pat0, prev: p0, next: n0 } = logArr[0] ?? {}
    expect(p0.length).toBe(0)
    expect(n0.length).toBe(1)
    expect(n0[0]).toBe(1)
    expect(pat0[0].op).toBe("add")
    expect(pat0[0].path.length).toBe(2)
    expect(pat0[0].path[0]).toBe("current")
    expect(pat0[0].path[1]).toBe(0)

    countContainer.commit((d) => {
      d.current[0] += 1
    })
    const { changedPatches: pat1, prev: p1, next: n1 } = logArr[1] ?? {}
    expect(p1.length).toBe(1)
    expect(p1[0]).toBe(1)
    expect(n1.length).toBe(1)
    expect(n1[0]).toBe(2)
    expect(pat1[0].op).toBe("replace")
    expect(pat1[0].path.length).toBe(2)
    expect(pat1[0].path[0]).toBe("current")
    expect(pat1[0].path[1]).toBe(0)
  })
})
