export const wait = (ms: number) =>
  new Promise<void>(resolve => {
    useTimeoutFn(resolve, ms)
  })
