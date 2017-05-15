export const ROUTER_CONFIG_METADATA_KEY = 'express:routerConfig';

export enum HTTPMethod {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE
}

export interface IRouterConfig {
  prefix?: string,
  path?: string
}

export interface IRouteConfig {
  path?: string,
  base?: boolean
}

export function methodDecoratorFactory(method: HTTPMethod) {
  const methodStr: string = HTTPMethod[method].toLocaleLowerCase();
  return function(config?: IRouteConfig) {
    return function(target: any, key?: string, propertyDescriptor?: PropertyDescriptor) {
      const routerConfig: IRouterConfig = getRouteConfig(target.constructor) || { [methodStr]: [] };
      if (config && config.base) config.path = '';
      (routerConfig as any)[methodStr] = ((routerConfig as any)[methodStr] || [])
        .concat(config && typeof config.path === "string" ? { path: config.path, key }: key);
      setRouteConfig(target.constructor, routerConfig);
      return propertyDescriptor;
    }
  }
}

export function Router(config: IRouterConfig) {
  return function(target: any, key?: string, propertyDescriptor?: PropertyDescriptor) {
    config.prefix = config.prefix || target.name;
    let existingConfig: IRouterConfig = getRouteConfig(target);
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

export function getRouteConfig(target: any): IRouterConfig {
  return Reflect.getMetadata(ROUTER_CONFIG_METADATA_KEY, target);
}

export function setRouteConfig(target: any, metadata: any): void {
  Reflect.defineMetadata(ROUTER_CONFIG_METADATA_KEY, metadata, target);
}
