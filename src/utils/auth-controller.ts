import { AuthUser } from './openapi-utils';
import { firebaseAdmin } from '../index';
import { IType } from './api-types';

const authenticate = async (idToken: string): Promise<AuthUser | boolean> =>
  await firebaseAdmin.auth().verifyIdToken(idToken).catch(() => false);

const setUserClaim = async (sub: string, claim: {
  username: string,
  type: IType, name: string, imageUrl?: string
}): Promise<void> => await firebaseAdmin.auth().setCustomUserClaims(sub, claim);

export { authenticate, setUserClaim };
