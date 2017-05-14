import { Provider } from 'injection-js';
import { Router, GET, POST, ROUTER_CONFIGURATION } from '.';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of';

let users = [{ firstName: 'Ivan', lastName: 'Ivanov' }, { firstName: 'Petar', lastName: 'Petrov' }];

@Router({
  path: '/api/user'
}) 
export class UserApiRouter {
  constructor() {}

  @GET() list(): Observable<any[]> {
    return Observable.of(users);
  }

  @POST() user({ firstName, lastName }: { firstName: string, lastName: string }): Observable<any[]> {
    users = users.concat({ firstName, lastName });
    return Observable.of(users);
  }

}

export const UserApiProvider: Provider = {
  provide: ROUTER_CONFIGURATION,
  useValue: UserApiRouter,
  multi: true
};