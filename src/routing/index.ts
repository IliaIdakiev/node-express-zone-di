import { Request, Response, Router as ERouter, Application } from 'express';
import { OpaqueToken, Inject, Injectable, forwardRef } from 'injection-js';
import { ExpressRouter } from '../app/providers';
import { Observable } from 'rxjs/Observable';
import { IRouteConfig, ROUTER_CONFIG_METADATA_KEY } from './decorators';
import 'rxjs/add/operator/reduce';

export * from './decorators';
export const ROUTER_CONFIGURATION = new OpaqueToken('ROUTER_CONFIGURATION');

const httpMethods = ['get', 'post', 'patch', 'delete', 'put'];

const requestHandler = (hanlder: any) => (req: Request, res: Response) => {
  let result: any, code: number = 200;
  try {
    result = hanlder(req.body);
  } catch (error) {
    console.error(error);
    result = 'Malformed Request Data';
    code = 400;
  } finally {
    const sendResponse = (data: any, code: number = 200) => res.status(code).send(data).end();
    if(result instanceof Observable) result.reduce((acc: any, curr: any) => acc.concat(curr),[]).subscribe(sendResponse);
    else if(result instanceof Promise) result.then(data => sendResponse(data));
    else sendResponse(result, code);
  }
}

@Injectable()
export class AppRouter {
  routers: { [path: string]: any } = {};
  constructor(@Inject(ROUTER_CONFIGURATION) routers: any[], @Inject(forwardRef(() => ExpressRouter)) ExpressRouter: any) {
    routers.forEach((Router: any) => {
      const config: IRouteConfig = Reflect.getOwnMetadata(ROUTER_CONFIG_METADATA_KEY, Router);
      const routerInstance = new Router();
      const expressRouter = ExpressRouter();

      httpMethods.forEach(method => {
        ((config as any)[method] || []).forEach((path: string) => { (expressRouter as any)[method](`/${path}`, requestHandler(routerInstance[path])) });
      });

      this.routers[config.path] = expressRouter;
    });
  }

  connect(app: Application) {
    for(const key in this.routers) {
      app.use(key, this.routers[key]);
    }
  }
}

export const AppRouterProvider = {
  provide: AppRouter,
  useClass: AppRouter
}
