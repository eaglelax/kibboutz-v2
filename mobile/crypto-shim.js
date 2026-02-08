// Polyfill for Node crypto module in React Native
import 'react-native-get-random-values';

export default {
  randomBytes: (size) => {
    const bytes = new Uint8Array(size);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    }
    return bytes;
  },
  createHash: () => ({
    update: () => ({ digest: () => '' }),
  }),
  createHmac: () => ({
    update: () => ({ digest: () => '' }),
  }),
};

export const randomBytes = (size) => {
  const bytes = new Uint8Array(size);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  }
  return bytes;
};

export const createHash = () => ({
  update: () => ({ digest: () => '' }),
});

export const createHmac = () => ({
  update: () => ({ digest: () => '' }),
});
