import { IUser } from './user.model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/mergeMap';

let users: IUser[] = [
  {
    id: 0,
    firstName: 'Ivan',
    lastName: 'Ivanov',
    email: 'ivan.ivanov@gmail.com'
  },
  {
    id: 1,
    firstName: 'Petar',
    lastName: 'Petrov',
    email: 'petar.petrov@gmail.com'
  }
];

let idx = 1;

export function Model({ tableName }: { tableName: string }) {
  return function (target: any, key?: string, propertyDescriptor?: PropertyDescriptor) {
    const spec: ZoneSpec = {
      name: tableName,
      properties: {
        dbTable: 'users'
      },
      onInvoke: (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function, applyThis: any, applyArgs: any[], source: string) => {
        /* Here we are simulation a database call */
        const saveCallback = function (value: any) {
          const targetUsers = applyThis['users'];

          if (users.length < targetUsers.length) {
            const newUser = targetUsers[targetUsers.length - 1];
            const match = users.filter(u => u.email === newUser.email);
            if (match.length !== 0) return Observable.throw('Email already in use!');
            newUser.id = ++idx;
          }

          users = targetUsers;
          return Observable.of(value);
        };

        applyThis['users'] = users;
        let result = parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);

        if (result instanceof Observable) {
          result = (result as Observable<any>).mergeMap(saveCallback);
        } else if (result instanceof Promise) {
          // TODO
        } else {
          // TODO
        }

        return result;
      }
    }

    const zone = Zone.current.fork(spec);

    Object.getOwnPropertyNames(target.prototype).slice(1);
    for (let method of Object.getOwnPropertyNames(target.prototype).slice(1)) {
      target.prototype[method] = zone.wrap(target.prototype[method], method);
    }

    return target;
  };
}