import { Transaction, TransactionMeta } from './Transaction';

export class UnconfirmedAdded {
  constructor(
    public readonly transaction: Transaction,
    public readonly meta: TransactionMeta
  ) {}
}
