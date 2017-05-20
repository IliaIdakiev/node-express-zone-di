import { Provider } from 'injection-js';
import { Router, GET, POST, ROUTER_CONFIGURATION, param, body } from '.';
import { Observable } from 'rxjs/Observable';
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

  @auth()
  @GET()
  list(): Observable<any[]> {
    return Observable.of(users);
  }

 /* * 
  *
  * optionalParameters: true - if we have list(id) with url /list/:id this will also add /list into the routes
  * 
  * TODO:
  * @optional decorator handling for arguments that allow the method list(@optional id) to be -> /lust/:id?
  *
  * */

  @GET({ 
    base: true,
    optionalParameters: true
  })
  getUser(@param() id: number, @param() role: string): Observable<any> {
    if (id) return Observable.of(users.filter(user => user.id === id));
    return Observable.of([]);
  }

  /* *
   * 
   * */
  @POST({ 
    base: true
  })
  setUser(@body() firstName: string, @body() lastName: string): Observable<any[]> {
    users = users.concat({ id: ++idx, firstName, lastName });
    return Observable.of(users);
  }

}

export const UserApiProvider: Provider = {
  provide: ROUTER_CONFIGURATION,
  useValue: User,
  multi: true
};