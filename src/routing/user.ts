import { Provider } from 'injection-js';
import { Router, GET, POST, ROUTER_CONFIGURATION } from '.';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of';

import { auth } from '../auth';
let idx = 1;
let users = [
  { 
    id: 0,
    firstName: 'Ivan', 
    lastName: 'Ivanov' 
  }, 
  { 
    id: 1,
    firstName: 'Petar', 
    lastName: 'Petrov' 
  }
];

@Router({
  prefix: '/api',
  path: '/user'
})
export class User {
  constructor() {}

  @GET()
  list({ params }: { params: any }): Observable<any[]> {
    return Observable.of(users);
  }

  @GET({ base: true })
  // getUser( { params }: { params: any }): Observable<any> {
  getUser(id: number): Observable<any> {
    if (id) return Observable.of(users.filter(user => user.id === id));
  }

  @POST({ base: true })
  // setUser({ firstName, lastName }: { firstName: string, lastName: string }): Observable<any[]> {
  setUser(firstName: string, lastName: string): Observable<any[]> {
    users = users.concat({ id: ++idx, firstName, lastName });
    return Observable.of(users);
  }

}

export const UserApiProvider: Provider = {
  provide: ROUTER_CONFIGURATION,
  useValue: User,
  multi: true
};