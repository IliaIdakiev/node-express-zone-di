export const ROUTER_CONFIG_METADATA_KEY = 'express:routerConfig';
export const PARAM_METADATA_KEY = 'express:routerParam';

export enum HTTPMethod {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE
}

export enum ParamsTypes {
  body,
  param,
  query
}

export interface IRouterConfig {
  prefix?: string,
  path?: string,
}

export interface IRouteConfig {
  path?: string,
  base?: boolean,
  optionalParameters?: boolean
}

export type ParamConfigData = { key: string, type?: ParamsTypes, optional?: boolean };

export interface IParamConfig {
  params: ParamConfigData[]
}

const ParamRegexFactory = (methodName: string): RegExp => new RegExp(`${methodName}\\(\\s*([^)]+?)\\s*\\)`, 'g');
const extractParams = (func: Function): string[] => {
  const matches: any[] = ParamRegexFactory(func.name).exec(func.toString()) || [];
  const match: string = matches[1];
  return match && match.split(',') || [];
}

export function paramDecoratorFactory(type: ParamsTypes) {
  return function (name?: string) {
    return function (target: any, key: string, index: number) {
      const params = extractParams(target[key]);
      const meta = getParamConfig(target.constructor, key) || { params: [] };
      meta.params[index] = { key: params[index].replace(/\s/, ''), type };
      setParamConfig(target.constructor, meta, key);
    };
  };
}

export const param = paramDecoratorFactory(ParamsTypes.param);
export const query = paramDecoratorFactory(ParamsTypes.query);
export const body = paramDecoratorFactory(ParamsTypes.body);

// export function optional() {
//   return function (target: any, key: string, index: number) {
//     const params = extractParams(target[key]);
//     const meta = getParamConfig(target.constructor, key) || { params: [] };
//     meta.params[index] = Object.assign({}, meta.params[index], { key: params[index], optional: true });
//     setParamConfig(target.constructor, meta, key);
//   }
// }

export function methodDecoratorFactory(method: HTTPMethod) {
  const methodStr: string = HTTPMethod[method].toLocaleLowerCase();
  return function (config?: IRouteConfig) {
    return function (target: any, key?: string, propertyDescriptor?: PropertyDescriptor) {
      const routerConfig: IRouterConfig = getRouterConfig(target.constructor) || { [methodStr]: [] };
      if (config && config.base) config.path = '';
      (routerConfig as any)[methodStr] = ((routerConfig as any)[methodStr] || [])
        .concat(config && typeof config.path === "string" ? { path: config.path, key, optionalParameters: config.optionalParameters } : key);
      setRouterConfig(target.constructor, routerConfig);
      return propertyDescriptor;
    }
  }
}

export function Router(config: IRouterConfig) {
  return function (target: any, key?: string, propertyDescriptor?: PropertyDescriptor) {
    config.prefix = config.prefix || target.name;
    let existingConfig: IRouterConfig = getRouterConfig(target);
    config = Object.assign({}, config, existingConfig);
    Reflect.defineMetadata(ROUTER_CONFIG_METADATA_KEY, config, target);
    return target;
  }
}

export const GET = methodDecoratorFactory(HTTPMethod.GET);
export const POST = methodDecoratorFactory(HTTPMethod.POST);
export const PATCH = methodDecoratorFactory(HTTPMethod.PATCH);
export const PUT = methodDecoratorFactory(HTTPMethod.PUT);
export const DELETE = methodDecoratorFactory(HTTPMethod.DELETE);

export function getRouterConfig(target: any): IRouterConfig {
  return Reflect.getMetadata(ROUTER_CONFIG_METADATA_KEY, target);
}

export function setRouterConfig(target: any, metadata: IRouterConfig): void {
  Reflect.defineMetadata(ROUTER_CONFIG_METADATA_KEY, metadata, target);
}

export function getParamConfig(target: any, key: string): IParamConfig {
  return Reflect.getMetadata(PARAM_METADATA_KEY, target, key);
}

export function setParamConfig(target: any, metadata: IParamConfig, key: string): void {
  Reflect.defineMetadata(PARAM_METADATA_KEY, metadata, target, key);
}