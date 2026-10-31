import { ApplicationData } from '@shared/models';

// Synthetic pre-migration AES-GCM backup. PIN: 1234. Never use real credentials.
export const legacyBackup: ApplicationData = {
  appData:
    '9UqY/FAyPbp1DBqupcTwhhYuyCkvBs22tYZrmCeYMp6RsTqH+mUogiPuXY6HX1nVxWJSflc=',
  salt: 'WzAsMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTVd',
  iv: 'WzE2LDE3LDE4LDE5LDIwLDIxLDIyLDIzLDI0LDI1LDI2LDI3XQ=='
};
