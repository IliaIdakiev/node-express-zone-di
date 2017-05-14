import { Injectable } from 'injection-js';

@Injectable()
export class CurrentUserService {
  constructor(public id: string, public fistName: string, public lastName: string) {}
  
  get fullName() {
    return this.fistName + ' ' + this.lastName;
  }
}