import * as express from 'express';
import * as fs from 'fs';
import { OpaqueToken, Provider } from 'injection-js';
import { App } from './application';

const ExpressApp = new OpaqueToken('Express');
const Config = new OpaqueToken('Config');
const ExpressRouter = new OpaqueToken('ExpressRouter');

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

export { ExpressApp, applicationProvider, expressProvider, configProvider, Config, ExpressRouter, routerProvider };