import { Dictionary } from './common/dictionary'

export type Route = {
  route: string
  params?: Dictionary<any>
};
