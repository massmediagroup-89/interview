import { Dictionary } from './dictionary'


export type Route = {
  route: string
  params?: Dictionary<any>
};
