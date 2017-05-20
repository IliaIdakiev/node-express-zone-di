import { OpaqueToken, Injectable } from 'injection-js';
import { App } from '../app/application';
import * as jwt from 'jsonwebtoken';
import { JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken';
export const AUTH_CONFIG_METADATA_KEY = 'express:authConfig';

const SECRET = 'SECRET';

export interface IAuthConfig {
  forClass: any[],
  forMethod: { [name: string]: any[] }
};

export const AUTH = new OpaqueToken('Auth');

export function auth(data: any = null) {
  return function (target: any, key?: string, propertyDescriptor?: PropertyDescriptor) {
    let config;
    const getConfig = (target: any) => getAuthConfig(target) || { forClass: [], forMethod: {}};
    if (!propertyDescriptor) {
      config = getConfig(target);
      config.forClass.push(data);
      setAuthConfig(target, config);
    } else {
      config = getConfig(target.constructor);
      (config.forMethod as any)[key] = (config.forMethod[key] || []).concat(data);
      setAuthConfig(target.constructor, config);
    }
  }
}

export function getAuthConfig(target: any): IAuthConfig {
  return Reflect.getMetadata(AUTH_CONFIG_METADATA_KEY, target);
}

export function setAuthConfig(target: any, metadata: any): void {
  Reflect.defineMetadata(AUTH_CONFIG_METADATA_KEY, metadata, target);
}

const users = [{
  id: 0,
  firstName: 'Ivan',
  lastName: 'Ivanov',
  role: 1
}, {
  id: 1,
  firstName: 'Petar',
  lastName: 'Petrov',
  role: 0
}];

/* * 
 * TODO: 
 * 1. key and SECRET need to be provided via config
 * 2. provide UserModel so we can fetch user from db and set it in zone
 * */

@Injectable()
export class JWTAuthenticator {
  extract(req: Request, res: Response, next: Function) {
    var token: string = (<any>req.headers)['x-access-token'];

    if (!token) {
      Zone.current.fork({
        name: 'Unauthenticated'
      }).run(() => next());
      return;
    }

    jwt.verify(token, SECRET, null, (err: JsonWebTokenError | TokenExpiredError | NotBeforeError, decoded: any) => {
      if (err) {
        Zone.current.fork({
          name: 'Error',
          properties: { err }
        }).run(() => next(err));
        return;
      }

      const user = users[decoded.id];
      Zone.current.fork({
        name: 'user-' + user.id,
        properties: user
      }).run(() => next());
    });
  }
}

/* * 
 * TODO: 
 * Create a cookie auth provider and service
 * */

export const JWTAuthProvider = {
  provide: AUTH,
  useClass: JWTAuthenticator
};