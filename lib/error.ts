export const ERROR_CODES = {
  UNAUTHORIZED: 1,
  FAILED_TO_SIGN_IN: 2,
  ICON_NOT_FOUND: 3,
}

export function getError(code: number) {
  switch (code) {
    case ERROR_CODES.UNAUTHORIZED:
      return 'You must be signed in to view this page.'
    case ERROR_CODES.FAILED_TO_SIGN_IN:
      return 'Failed to sign in. Please try again.'
    case ERROR_CODES.ICON_NOT_FOUND:
      return 'Icon not found.'
  }
}
