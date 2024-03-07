export class AccountInfo {
  constructor(
    public readonly account: {
      version: number;
      address: string;
      addressHeight: string;
      publicKey: string;
      publicKeyHeight: string;
      accountType: number;
      supplementalPublicKeys?: {
        linked?: {
          publicKey?: string;
        };
        vrf?: {
          publicKey?: string;
        };
        voting?: {
          publicKeys?: {
            publicKey?: string;
            startEpoch?: number;
            endEpoch?: number;
          }[];
        };
      };
      activityBuckets?: {
        startHeight?: string;
        totalFeesPaid?: string;
        beneficiaryCount?: number;
        rawScore?: string;
      }[];
      mosaics?: {
        id?: string;
        amount?: string;
      }[];
      importance?: string;
      importanceHeight?: string;
    },
    public readonly id: string
  ) {}
}
