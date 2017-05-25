import { Model } from './decorators';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

export interface IUser {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
}

@Model({
  tableName: 'users'
})
export class UserModel {

  private users: IUser[];

  get(id?: number): Observable<IUser[]> {
    return id ? Observable.of(this.users.filter(u => u.id === id)) : Observable.of(this.users);
  }

  add(newUser: IUser): Observable<IUser[]> {
    this.users = this.users.concat(newUser)
    return Observable.of(this.users);
  }
}