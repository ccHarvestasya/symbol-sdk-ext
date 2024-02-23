import { Transaction, TransactionMeta } from './Transaction';

export class Confirmed {
  constructor(
    public readonly transaction: Transaction,
    public readonly meta: TransactionMeta
  ) {}
}
