import { expect, test } from '@playwright/test'
test('profiles switch and completed pair persists',async({page})=>{
  await page.addInitScript(()=>{if(!localStorage.getItem('mega-profiles'))localStorage.setItem('mega-profiles',JSON.stringify([{id:'explorer-1',name:'Räven',level:1,stars:0},{id:'explorer-2',name:'Björnen',level:1,stars:0}]))})
  await page.goto('/')
  await expect(page.getByRole('heading',{name:'Familjens lärhub'})).toBeVisible()
  await page.getByRole('button',{name:/Björnen/}).click()
  const ids=['1-0','2-1','3-2','1-3','2-4','3-5']
  const values=new Map<string,string[]>()
  for(let i=0;i<ids.length;i+=2){
    await page.getByTestId(ids[i]).click(); await page.getByTestId(ids[i+1]).click()
    const labels=await Promise.all([ids[i],ids[i+1]].map(id=>page.getByTestId(id).getAttribute('aria-label')))
    labels.forEach((label,index)=>{if(label){const existing=values.get(label)??[]; existing.push(ids[i+index]); values.set(label,existing)}})
    if(await page.getByText('1 stjärnor').isVisible().catch(()=>false)){await page.reload();await expect(page.getByText('1 stjärnor')).toBeVisible();return}
    await page.waitForTimeout(700)
  }
  const pair=[...values.values()].find(items=>items.length===2)
  if(!pair) throw new Error('did not discover a pair')
  await page.getByTestId(pair[0]).click(); await page.getByTestId(pair[1]).click()
  await expect(page.getByText('1 stjärnor')).toBeVisible()
  await page.reload(); await expect(page.getByText('1 stjärnor')).toBeVisible()
})
test('PWA metadata is reachable',async({page,request})=>{await page.goto('/');await expect(page.locator('link[rel=manifest]')).toHaveAttribute('href','/manifest.webmanifest');expect((await request.get('/manifest.webmanifest')).ok()).toBe(true);expect((await request.get('/sw.js')).ok()).toBe(true)})
