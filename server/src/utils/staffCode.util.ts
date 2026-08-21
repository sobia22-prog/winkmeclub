import { User } from '../models/user.model';

/**
 * Generates an 8-10 character staff invitation code starting with 'ST1' followed by random digits.
 * Example: ST18492041, ST19301824
 */
export const generateStaffInvitationCode = async (): Promise<string> => {
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    const prefix = 'ST1';
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 random digits (8 chars total e.g. ST1849201)
    code = `${prefix}${randomDigits}`;

    const existingUser = await User.findOne({ invitationCode: code });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return code;
};
