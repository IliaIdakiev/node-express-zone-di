import { UserModel } from './user.model';

export const modelProviders = [{ provide: UserModel, useClass: UserModel }];
export { UserModel };