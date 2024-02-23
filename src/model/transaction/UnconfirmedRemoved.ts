import { TransactionRemoveMeta } from './Transaction';

export class UnconfirmedRemoved {
  constructor(public readonly meta: TransactionRemoveMeta) {}
}
