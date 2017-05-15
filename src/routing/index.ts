import { Request, Response, Router as ERouter, Application } from 'express';
import { OpaqueToken, Inject, Injectable, forwardRef } from 'injection-js';
import { ExpressRouter } from '../app/providers';
import { Observable } from 'rxjs/Observable';
import { IRouterConfig, ROUTER_CONFIG_METADATA_KEY, HTTPMethod } from './decorators';
import 'rxjs/add/operator/reduce';

export * from './decorators';
export const ROUTER_CONFIGURATION = new OpaqueToken('ROUTER_CONFIGURATION');

const httpMethods = ['get', 'post', 'patch', 'delete', 'put'];

/* *
 * TODO:
 * Return type can be defined using Reflect so there is no need for if and else if statements
 * inside finally block
 * */

const requestHandler = (hanlder: any, paramtypes: string, returntype: string) => {
  return (req: Request, res: Response) => {
    let result: any, code: number = 200;
    try {
      const method = req.method;
      const args = {
        params: req.params,
        query: req.query
      }
      if (req.body) (args as any)['body'] = req.body;

      result = hanlder(args);
    } catch (error) {
      console.error(error);
      result = 'Malformed Request Data';
      code = 400;
    } finally {
      const sendResponse = (data: any, code: number = 200) => res.status(code).send(data).end();
      if (result instanceof Observable) result.reduce((acc: any, curr: any) => acc.concat(curr), []).subscribe(sendResponse);
      else if (result instanceof Promise) result.then(data => sendResponse(data));
      else sendResponse(result, code);
    }
  }
}

@Injectable()
export class AppRouter {
  routers: { [path: string]: any } = {};
  constructor( @Inject(ROUTER_CONFIGURATION) routers: any[], @Inject(forwardRef(() => ExpressRouter)) ExpressRouter: any) {
    routers.forEach((Router: any) => {
      const config: IRouterConfig = Reflect.getOwnMetadata(ROUTER_CONFIG_METADATA_KEY, Router);
      const routerInstance = new Router();
      const expressRouter = ExpressRouter();

      httpMethods.forEach(method => {
        ((config as any)[method] || []).forEach((item: string) => {
          const { path, key } = (typeof item === "object") ? item : { path: item, key: item };

          /* *
           *  Availabe metadata:
           * 
           *  'design:type'
           *  'design:returntype'
           *  'design:paramtypes'
           * */

          const paramtypes = Reflect.getOwnMetadata('design:paramtypes', Router.prototype, key);
          const returntype = Reflect.getOwnMetadata('design:returntype', Router.prototype, key);
          (expressRouter as any)[method](`/${path}`, requestHandler(routerInstance[key].bind(routerInstance),  paramtypes, returntype))
        });
      });

      this.routers[config.prefix + config.path] = expressRouter;
    });
  }

  connect(app: Application) {
    for (const key in this.routers) {
      app.use(key, this.routers[key]);
    }
  }
}

export const AppRouterProvider = {
  provide: AppRouter,
  useClass: AppRouter
}
