import { expect, test } from '@playwright/test'
import { describe } from 'node:test'

describe('home page', () => {
  describe('unauthenticated', () => {
    test('has sign in cta', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await expect(page.getByTestId('sign-in-cta')).toBeVisible()
    })
  })
})
