import { Transaction, TransactionMeta } from './Transaction';

export class PartialAdded {
  constructor(
    public readonly transaction: Transaction,
    public readonly meta: TransactionMeta
  ) {}
}
