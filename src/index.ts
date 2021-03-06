import 'reflect-metadata';
import 'zone.js';
import { ReflectiveInjector } from 'injection-js';
import {
  expressProvider,
  applicationProvider,
  configProvider,
  routerProvider
} from './app/providers';
import { UserApiProvider } from './routing/user';
import { AppRouterProvider } from './routing';
import { JWTAuthProvider } from './auth';
import { modelProviders } from './models';
import { App } from './app/application';

const injector = ReflectiveInjector.resolveAndCreate([
  expressProvider,
  configProvider,
  applicationProvider,
  routerProvider,
  UserApiProvider,
  AppRouterProvider,
  JWTAuthProvider,
  ...modelProviders
]);

const app = injector.get(App);
app.start();
