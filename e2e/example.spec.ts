import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
    test('should load successfully', async ({ page }) => {
        await page.goto('/')

        // 페이지 타이틀 확인
        await expect(page).toHaveTitle(/Create Next App/)
    })

    test('should display main content', async ({ page }) => {
        await page.goto('/')

        // 페이지에 텍스트가 있는지 확인
        const body = page.locator('body')
        await expect(body).toBeVisible()
    })
})
