export type ServiceResult<T> = {
  errorCode: number;
  isSuccess: boolean;
  value: T | null;
};

export type SetupResponse = {
  email: string;
  manualEntryKey: string;
  qrCodeImageUrl: string;
};
