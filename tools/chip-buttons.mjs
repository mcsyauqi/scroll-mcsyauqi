export default async ({ page }) => {
  const chip = page.locator('img[alt="Ingredient image"]').first();
  console.log('chips', await page.locator('img[alt="Ingredient image"]').count());
  const info = await chip.evaluate(img => { let n = img; const out = []; for (let k = 0; k < 4 && n; k++, n = n.parentElement) out.push([...n.querySelectorAll('button')].map(b => b.getAttribute('aria-label') || b.innerText.trim())); return out; });
  console.log(JSON.stringify(info));
};
