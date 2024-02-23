import { TransactionRemoveMeta } from './Transaction';

export class PartialRemoved {
  constructor(public readonly meta: TransactionRemoveMeta) {}
}
