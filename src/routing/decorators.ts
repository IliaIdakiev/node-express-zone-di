export const ROUTER_CONFIG_METADATA_KEY = 'express:routerConfig';

export enum HTTPMethod {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE
}

export interface IRouteConfig {
  path?: string,
  get?: string[],
  post?: string[]
}

export function methodDecoratorFactory(method: HTTPMethod) {
  const methodStr: string = HTTPMethod[method].toLocaleLowerCase();
  return function() {
    return function(target: any, key?: string, propertyDescriptor?: PropertyDescriptor) {
      const config: IRouteConfig = getRouteConfig(target.constructor) || { [methodStr]: [] };
      (config as any)[methodStr] = ((config as any)[methodStr] || []).concat(key);
      setRouteConfig(target.constructor, config);
      return propertyDescriptor;
    }
  }
}

export function Router(config: IRouteConfig) {
  return function(target: any, key?: string, propertyDescriptor?: PropertyDescriptor) {
    let existingConfig: IRouteConfig = getRouteConfig(target);
    config = Object.assign({}, config, existingConfig);
    Reflect.defineMetadata(ROUTER_CONFIG_METADATA_KEY, config, target);
    return target;
  }
}

export const GET    = methodDecoratorFactory(HTTPMethod.GET);
export const POST   = methodDecoratorFactory(HTTPMethod.POST);
export const PATCH  = methodDecoratorFactory(HTTPMethod.PATCH);
export const PUT    = methodDecoratorFactory(HTTPMethod.PUT);
export const DELETE = methodDecoratorFactory(HTTPMethod.DELETE);

export function getRouteConfig(target: any): IRouteConfig {
  return Reflect.getMetadata(ROUTER_CONFIG_METADATA_KEY, target);
}

export function setRouteConfig(target: any, metadata: any): void {
  Reflect.defineMetadata(ROUTER_CONFIG_METADATA_KEY, metadata, target);
}
