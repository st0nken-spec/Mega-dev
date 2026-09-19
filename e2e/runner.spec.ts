import { expect, test, type Locator } from '@playwright/test'

const openGame = async (page: import('@playwright/test').Page) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Spela' }).click()
  await page.getByRole('button', { name: 'Djungellöpet' }).click()
  await expect(page.getByRole('region', { name: 'Djungellöpet' })).toContainText('Trädkronorna')
}

const answerDotQuiz = async (options: Locator) => {
  const prompt = await options.locator('..').locator('.runner-quiz').innerText()
  const target = Number(prompt.trim())
  const count = await options.locator('button').count()
  for (let i = 0; i < count; i++) {
    const text = await options.locator('button').nth(i).innerText()
    if ((text.match(/●/g) ?? []).length === target) { await options.locator('button').nth(i).click(); return }
  }
  throw new Error(`no option matches ${target}`)
}

test('teaches jump and duck, quizzes the last seed and starts the chase', async ({ page }) => {
  await openGame(page)
  const tutorial = page.getByRole('region', { name: 'Trädkronorna' })
  await tutorial.getByRole('button', { name: 'Hoppa' }).click()
  await expect(tutorial.getByLabel('Frö 1 av 3')).toBeVisible()
  await tutorial.getByRole('button', { name: 'Ducka' }).click()
  await expect(tutorial.getByLabel('Frö 2 av 3')).toBeVisible()
  await answerDotQuiz(tutorial.locator('.runner-options'))
  await expect(page.getByLabel('Djungelbana')).toBeVisible()
  await expect(page.getByLabel('Banans framsteg')).toBeVisible()
  await page.getByRole('button', { name: 'Hoppa' }).click()
})

test('completes all three stages in pure-fun mode and awards a star', async ({ page }) => {
  test.setTimeout(90000)
  await openGame(page)
  await expect(page.getByText('Räven · 0 stjärnor')).toBeVisible()
  await page.getByRole('button', { name: 'Bara lek' }).click()
  const tutorial = page.getByRole('region', { name: 'Trädkronorna' })
  await tutorial.getByRole('button', { name: 'Hoppa' }).click()
  await tutorial.getByRole('button', { name: 'Ducka' }).click()
  await tutorial.getByRole('button', { name: 'Spår 2' }).click()

  const boss = page.getByRole('region', { name: 'Vaktkatten' })
  await expect(page.getByLabel('Djungelbana')).toBeVisible()
  for (let i = 0; i < 140 && !(await boss.isVisible()); i++) {
    const button = page.getByRole('button', { name: i % 2 === 0 ? 'Hoppa' : 'Ducka' }).first()
    if (await button.isVisible()) await button.click().catch(() => undefined)
    await page.waitForTimeout(90)
  }
  await expect(boss).toBeVisible({ timeout: 10000 })

  const done = page.getByRole('region', { name: 'Äventyret klart' })
  for (let i = 0; i < 80 && !(await done.isVisible()); i++) {
    const banner = await boss.locator('.runner-banner').innerText()
    if (banner.includes('ducka')) {
      await boss.getByRole('button', { name: 'Ducka' }).click()
    } else {
      const target = Number(banner.match(/spår (\d)/)?.[1] ?? '2')
      await boss.getByRole('button', { name: `Spår ${target === 2 ? 1 : 2}`, exact: true }).click()
    }
    await page.waitForTimeout(350)
  }
  await expect(done).toBeVisible({ timeout: 10000 })
  await expect(done).toContainText('Djungeln är trygg')
  await expect(page.getByText('Räven · 1 stjärnor')).toBeVisible()
})

test('plays the tutorial and chase with the keyboard', async ({ page }) => {
  await openGame(page)
  const tutorial = page.getByRole('region', { name: 'Trädkronorna' })
  await page.keyboard.press(' ')
  await expect(tutorial.getByLabel('Frö 1 av 3')).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await expect(tutorial.getByLabel('Frö 2 av 3')).toBeVisible()
  await answerDotQuiz(tutorial.locator('.runner-options'))
  await expect(page.getByLabel('Djungelbana')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('button', { name: 'Spår 3' })).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('button', { name: 'Spår 2' })).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press(' ')
})
