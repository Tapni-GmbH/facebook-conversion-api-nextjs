import { createHash } from 'crypto';

const sha256Hash = (string: string) => createHash('sha256').update(string).digest('hex');

export { sha256Hash };
