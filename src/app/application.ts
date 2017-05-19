import { Application } from 'express';
import * as bodyParser from 'body-parser';
import { Injectable, Inject, forwardRef } from 'injection-js';
import { ExpressApp, Config } from './providers';
import { ROUTER_CONFIGURATION, getRouterConfig } from '../routing';
import { AppRouter } from '../routing';

@Injectable()
export class App {
  constructor(
    @Inject(forwardRef(() => ExpressApp)) private expressApp: Application, 
    @Inject(forwardRef(() => Config)) public config: any,
    @Inject(forwardRef(() => ROUTER_CONFIGURATION)) private routers: any[],
    private appRouter: AppRouter
  ) { }

  start(cb: Function) { 
    // parse application/x-www-form-urlencoded 
    this.expressApp.use(bodyParser.urlencoded({ extended: true }));
    
    // parse application/json 
    this.expressApp.use(bodyParser.json());
    
    this.appRouter.connect(this.expressApp);
    

    this.expressApp.get('/', (req: any, res: any) => { 
      res.send('hi!').end()
    });

    this.expressApp.listen(this.config.port, () => console.info('Server listening on ' + this.config.port));
  }
}