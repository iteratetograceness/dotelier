export const ERROR_CODES = {
  UNAUTHORIZED: 1,
  FAILED_TO_SIGN_IN: 2,
  ICON_NOT_FOUND: 3,
  UNEXPECTED_ERROR: 4,
  VECTORIZATION_ERROR: 5,
  IMAGE_NOT_PNG: 6,
  INVALID_SCHEMA: 7,
  INVALID_BODY: 8,
  MISSING_PROMPT: 9,
  FAILED_TO_GENERATE_ICON: 10,
  NO_CREDITS: 11,
  FAILED_TO_SAVE_ICON: 12,
  FAILED_TO_EDIT_ICON: 13,
  RATE_LIMITED: 14,
}

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

export function getError(code: ErrorCode) {
  switch (code) {
    case ERROR_CODES.UNAUTHORIZED:
      return 'Unauthorized.'
    case ERROR_CODES.FAILED_TO_SIGN_IN:
      return 'Failed to sign in.'
    case ERROR_CODES.ICON_NOT_FOUND:
      return 'Icon not found.'
    case ERROR_CODES.UNEXPECTED_ERROR:
      return 'An unexpected error occurred.'
    case ERROR_CODES.VECTORIZATION_ERROR:
      return 'Failed to vectorize image.'
    case ERROR_CODES.IMAGE_NOT_PNG:
      return 'Image must be a PNG.'
    case ERROR_CODES.INVALID_SCHEMA:
      return 'Invalid schema.'
    case ERROR_CODES.INVALID_BODY:
      return 'Invalid body.'
    case ERROR_CODES.MISSING_PROMPT:
      return 'Prompt is required.'
    case ERROR_CODES.FAILED_TO_GENERATE_ICON:
      return 'Failed to generate icon.'
    case ERROR_CODES.NO_CREDITS:
      return 'You have no credits left.'
    case ERROR_CODES.FAILED_TO_SAVE_ICON:
      return 'Failed to save icon.'
    case ERROR_CODES.FAILED_TO_EDIT_ICON:
      return 'Failed to edit icon.'
    case ERROR_CODES.RATE_LIMITED:
      return 'Too many requests. Please wait a moment.'
  }
}
