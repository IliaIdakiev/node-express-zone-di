import { Injectable } from 'injection-js';

@Injectable()
export class UserModel {
  users = [
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
}