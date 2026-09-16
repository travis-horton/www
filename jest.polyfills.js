// jsdom has no TextEncoder/TextDecoder, but React Router 7 reaches for them the
// moment it is imported. Node has both, so borrow them. This must run from
// `setupFiles` (before any test module loads), not `setupFilesAfterEnv`.
const { TextEncoder, TextDecoder } = require('node:util');

Object.assign(globalThis, { TextEncoder, TextDecoder });
