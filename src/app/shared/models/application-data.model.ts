export type ApplicationData = {
  salt: string | null;
  iv: string | null;
  appData: EncryptedAppData | string | null;
};

export type EncryptedAppData = {
  apiKey: string | null;
  assets: unknown[] | string | null;
};
