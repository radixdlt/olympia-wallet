import { Observable } from 'rxjs'

export type Observed<O> = O extends Observable<infer T> ? T : never
