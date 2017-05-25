import { Application } from 'express';
import * as bodyParser from 'body-parser';
import { Injectable, Inject, forwardRef } from 'injection-js';
import { ExpressApp, Config } from './providers';
import { ROUTER_CONFIGURATION, getRouterConfig } from '../routing';
import { AppRouter } from '../routing';
import { AUTH } from '../auth';

@Injectable()
export class App {
  constructor(
    @Inject(forwardRef(() => ExpressApp)) private expressApp: Application, 
    @Inject(forwardRef(() => Config)) public config: any,
    @Inject(forwardRef(() => ROUTER_CONFIGURATION)) private routers: any[],
    @Inject(AUTH) private auth: any,
    private appRouter: AppRouter
  ) { }

  start(cb: Function) { 
    this.expressApp.use(bodyParser.urlencoded({ extended: true }));
    this.expressApp.use(bodyParser.json());
    this.expressApp.use((this.auth as any)['extract']);
    this.appRouter.connect(this.expressApp);

    this.expressApp.get('/', (req: any, res: any) => { 
      res.send('hi!').end()
    });

    Zone.current.fork({ name: 'AppName' }).run(() => {
      this.expressApp.listen(this.config.port, () => console.info('Server listening on ' + this.config.port));
    });
  }
}