export class Handlers<HANDLER extends (...args: any[]) => any> {
  private handlers = new Set<HANDLER>()

  add(handler: HANDLER) {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  trigger(...args: Parameters<HANDLER>): ReturnType<HANDLER>[] {
    return Array.from(this.handlers).map((handler) => handler(...args))
  }

  clear() {
    this.handlers.clear()
  }
}
