export const AUTH_CONFIG_METADATA_KEY = 'express:authConfig';

export interface IAuthConfig {
  forClass: any[],
  forMethod: { [name: string]: any[] }
}

export function auth(data: any) {
  return function(target: any, key?: string, propertyDescriptor?: PropertyDescriptor) {
    let config;
    if (!propertyDescriptor) {
      config = getAuthConfig(target);
      config.forClass.push(data);
      setAuthConfig(target, config);
    } else {
      config = getAuthConfig(target.constructor);
      (config.forMethod as any)[key] = (config.forMethod[key] || []).push(data);
      setAuthConfig(target.constructor, config);
    }
  }
}

export function getAuthConfig(target: any): IAuthConfig {
  return Reflect.getMetadata(AUTH_CONFIG_METADATA_KEY, target) || { forClass: [], forMethod: {}};
}

export function setAuthConfig(target: any, metadata: any): void {
  Reflect.defineMetadata(AUTH_CONFIG_METADATA_KEY, metadata, target);
}
