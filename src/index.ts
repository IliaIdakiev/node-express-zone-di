import 'reflect-metadata';
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

const injector = ReflectiveInjector.resolveAndCreate([
  expressProvider, 
  configProvider, 
  applicationProvider,
  routerProvider,
  UserApiProvider,
  AppRouterProvider
]);

const app = injector.get(App);
app.start();