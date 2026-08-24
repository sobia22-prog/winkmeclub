import { User } from '../models/user.model';

/**
 * Generates a short 6-character staff invitation code starting with 'ST' followed by 4 random digits.
 * Example: ST1234, ST9082, ST4512
 */
export const generateStaffInvitationCode = async (): Promise<string> => {
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    const prefix = 'ST';
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 random digits (6 chars total e.g. ST4920)
    code = `${prefix}${randomDigits}`;

    const existingUser = await User.findOne({ invitationCode: code });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return code;
};
