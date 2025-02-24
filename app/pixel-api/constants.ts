export const API_STYLES = ['color_v2', 'monochrome'] as const
export type ApiStyle = (typeof API_STYLES)[number]
