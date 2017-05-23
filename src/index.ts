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
import { App } from './app/application';
import { JWTAuthProvider } from './auth';
import { UserModel } from './models/user.model';

const injector = ReflectiveInjector.resolveAndCreate([
  expressProvider,
  configProvider,
  applicationProvider,
  routerProvider,
  UserApiProvider,
  AppRouterProvider,
  JWTAuthProvider,
  { provide: UserModel, useClass: UserModel }
]);

const app = injector.get(App);
app.start();