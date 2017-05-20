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
import { AUTH_FUNC, JWTAuthProvider } from './auth';

const authFunctionProvider = {
  provide: AUTH_FUNC,
  useValue: ({ firstName, lastName, role }: { firstName: string, lastName: string, role: number }) => {
    return role === 0;
  }
}

// const authParserProvider = {
//   provide: AUTH_PARSER,
//   useValue: ()
// }

const injector = ReflectiveInjector.resolveAndCreate([
  expressProvider, 
  configProvider, 
  applicationProvider,
  routerProvider,
  UserApiProvider,
  AppRouterProvider,
  authFunctionProvider,
  JWTAuthProvider
]);

const app = injector.get(App);
app.start();