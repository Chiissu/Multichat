import { Emitter, EventMap } from "strict-event-emitter";

export class CombinedEmitter<T extends EventMap> extends Emitter<T> {
  private eventList: Array<keyof T>
  constructor(eventList: Array<keyof T>){
    super()
    this.eventList = eventList
  }
  addEmitters(emitters: Emitter<T>[]) {
    for (let emitter of emitters) {
      for (let eventName of this.eventList) {
        emitter.addListener(eventName, (...data) => {
          this.emit(eventName, ...data);
        });
      }
    }
  }
}
