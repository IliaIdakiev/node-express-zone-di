import { Request, Response, Router as ERouter, Application } from 'express';
import { OpaqueToken, Inject, Injectable, forwardRef, Injector } from 'injection-js';
import { ExpressRouter } from '../app/providers';
import { Observable } from 'rxjs/Observable';
import {
  IRouterConfig,
  IParamConfig,
  getRouterConfig,
  getParamConfig,
  HTTPMethod,
  ParamsTypes,
  ParamConfigData
} from './decorators';
import { getAuthConfig, IAuthConfig } from '../auth';
import 'rxjs/add/operator/reduce';

export * from './decorators';
export const ROUTER_CONFIGURATION = new OpaqueToken('ROUTER_CONFIGURATION');

const httpMethods = ['get', 'post', 'patch', 'delete', 'put'];

const sendResponse = (res: Response, data: any, code: number = 200) => res.status(code).send(data).end();

const responseHandlerMap: { [key: string]: (handler: Function, data: any, res: Response) => void } = {
  'Observable': (handler: Function, data: any, res: Response) => {
    (handler(...data) as Observable<any>).reduce((acc: any, curr: any) => acc.concat(curr), []).subscribe(data => sendResponse(res, data));
  },
  'Promise': (handler: Function, data: any, res: Response) => {
    (handler(...data) as Promise<any>).then(data => sendResponse(res, data));
  },
  'default': (handler: Function, data: any, res: Response) => {
    sendResponse(res, handler(...data));
  }
};

const dataExtractionMap: { [key: number]: (req: Request, key: string, paramtype: Function) => any } = {
  [ParamsTypes.param]: (req: Request, key: string, paramtype: Function) => paramtype(req.params[key]) || null,
  [ParamsTypes.query]: (req: Request, key: string, paramtype: Function) => paramtype(req.query[key]) || null,
  [ParamsTypes.body]: (req: Request, key: string, paramtype: Function) => paramtype(req.body && req.body[key]) || null,
} as { [type: number]: any };



const requestHandlerFactory = (httpType: string, hanlder: any, paramMetadata: ParamConfigData[], paramtypes: any[], returntype: string) => {
  const responseHandler = responseHandlerMap[returntype];
  return (req: Request, res: Response) => {
    const data = paramtypes.map((paramtype: any, index: number) => {
      const paramMeta = paramMetadata[index];
      return dataExtractionMap[paramMeta.type](req, paramMeta.key, paramtype);
    });
    responseHandler(hanlder, data, res);    
  }
}

@Injectable()
export class AppRouter {
  routers: { [path: string]: any } = {};
  constructor(
    @Inject(ROUTER_CONFIGURATION) routers: any[], 
    @Inject(forwardRef(() => ExpressRouter)) ExpressRouter: any,
    injector: Injector
  ) {
    routers.forEach((Router: any) => {
      const config: IRouterConfig = getRouterConfig(Router);
      const authConfig: IAuthConfig = getAuthConfig(Router);
      const paramtypes: any[] = Reflect.getOwnMetadata('design:paramtypes', Router);
      const routerInstance = new Router(...paramtypes.map(type => injector.get(type)));
      const expressRouter = ExpressRouter();

      httpMethods.forEach(method => {
        ((config as any)[method] || []).forEach((item: string) => {
          let middleware = [];
          const { path, key, optionalParameters } = (typeof item === "object") ? item : { path: item, key: item, optionalParameters: false };

          /* *
           *  Availabe metadata:
           * 
           *  'design:type'
           *  'design:returntype'
           *  'design:paramtypes'
           * 
           * */

          const paramtypes: string[] = Reflect.getOwnMetadata('design:paramtypes', Router.prototype, key);
          const returntype: string = Reflect.getOwnMetadata('design:returntype', Router.prototype, key).name;
          const metaparam: IParamConfig = getParamConfig(Router, key) || { params: [] };

          let urlParamString = metaparam.params.filter(param => param.type === ParamsTypes.param).map(param => param.key).join('/:');
          if (urlParamString) urlParamString = '/:' + urlParamString;
          let methodAuth: any[];
          if (authConfig && (methodAuth = (authConfig.forMethod as any)[path])) {
            middleware.push((req: Request, res: Response, next: Function) => {
              // TODO handle methodAuth array properly 
              const authConf = methodAuth[0];
              if (authConf !== null) {
                let result: boolean = true;
                for (let key in authConf) {
                  if (authConf[key] !== Zone.current.get(key)) {
                    result = false;
                    break;
                  }
                }
                if (result) return next();
              } else {
                const name = Zone.current.name;
                if (name !== 'Unauthenticated') return next();
              }
              res.status(401).end();
            });
          }

          (expressRouter as any)[method](`/${path}${urlParamString}`.replace('//', '/'), ...middleware,
            requestHandlerFactory(method, routerInstance[key].bind(routerInstance), metaparam.params, paramtypes, returntype))

          if (optionalParameters) (expressRouter as any)[method](`/${path}`, ...middleware,
            requestHandlerFactory(method, routerInstance[key].bind(routerInstance), metaparam.params, paramtypes, returntype))
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
