import { expect, test } from '@playwright/test'

const openGame = async (page: import('@playwright/test').Page) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Spela' }).click()
  await page.getByRole('button', { name: 'Hjältebanan' }).click()
  await expect(page.getByRole('region', { name: 'Hjältebanan' })).toContainText('Träningsbanan')
}

const finishCourse = async (page: import('@playwright/test').Page) => {
  const course = page.getByRole('region', { name: 'Träningsbanan' })
  for (let i = 0; i < 5; i++) {
    const prompt = await course.locator('.runner-prompt').innerText()
    await course.getByRole('button', { name: /hoppa/i.test(prompt) ? 'Hoppa' : 'Ducka' }).click()
  }
}

test('runs the no-fail training course and starts the faster chase', async ({ page }) => {
  await openGame(page)
  await finishCourse(page)
  await expect(page.getByLabel('Löparled')).toBeVisible()
  await expect(page.getByLabel('Banans framsteg')).toBeVisible()
  await page.getByRole('button', { name: 'Hoppa' }).click()
})

test('blocks the gate keeper in pure-fun mode and awards a star', async ({ page }) => {
  test.setTimeout(90000)
  await openGame(page)
  await expect(page.getByText('Räven · 0 stjärnor')).toBeVisible()
  await page.getByRole('button', { name: 'Bara lek' }).click()
  await finishCourse(page)

  const keeper = page.getByRole('region', { name: 'Portvakten' })
  await expect(page.getByLabel('Löparled')).toBeVisible()
  for (let i = 0; i < 160 && !(await keeper.isVisible()); i++) {
    const button = page.getByRole('button', { name: i % 2 === 0 ? 'Hoppa' : 'Ducka' }).first()
    if (await button.isVisible()) await button.click().catch(() => undefined)
    await page.waitForTimeout(80)
  }
  await expect(keeper).toBeVisible({ timeout: 10000 })

  const done = page.getByRole('region', { name: 'Hjältebanan klar' })
  for (let i = 0; i < 100 && !(await done.isVisible()); i++) {
    const block = keeper.getByRole('button', { name: 'Blockera' })
    if (await block.isVisible()) await block.click().catch(() => undefined)
    await page.waitForTimeout(300)
  }
  await expect(done).toBeVisible({ timeout: 10000 })
  await expect(done).toContainText('Porten är öppen')
  await expect(page.getByText('Räven · 1 stjärnor')).toBeVisible()
})
