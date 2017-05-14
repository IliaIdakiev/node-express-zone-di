import 'reflect-metadata';
import { ReflectiveInjector } from 'injection-js';
import { 
  expressProvider, 
  applicationProvider,
  configProvider,
  routerProvider
} from './app/providers';
import { UserApiProvider } from './routing/userApi';
import { AppRouterProvider } from './routing';
import { App } from './app/application';

// import { DECOR, PARAMDECOR, PROPDECOR } from './routing';


// @DECOR({
//   selector: 'alabala',
//   test: 'hohoho'
// }) class Something {

// }

// class Something {
//   // @PROPDECOR() prop: any;
//   constructor(@PARAMDECOR() test: any) {
//     console.log(test);
//   }
// }

// var b = new Something(12312);

// return;

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