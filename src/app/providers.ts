import * as express from 'express';
import * as fs from 'fs';
import { OpaqueToken, Provider } from 'injection-js';
import { App } from './application';

export const ExpressApp = new OpaqueToken('Express');
export const Config = new OpaqueToken('Config');
export const ExpressRouter = new OpaqueToken('ExpressRouter');

const applicationProvider: Provider = {
  provide: App,
  useClass: App
};

const expressProvider: Provider = {
  provide: ExpressApp,
  useFactory: function () {
    return express();
  }
};

const routerProvider: Provider = {
  provide: ExpressRouter,
  useValue: express.Router
};

const configProvider: Provider = {
  provide: Config,
  useFactory: function () {
    return {
      port: '4200'
    };
  }
}

export { applicationProvider, expressProvider, configProvider, routerProvider };