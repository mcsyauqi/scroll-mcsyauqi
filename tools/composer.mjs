// list composer buttons + chip count
export default async ({ page }) => {
  console.log(JSON.stringify(await page.evaluate(() => { let n = [...document.querySelectorAll('[contenteditable="true"]')].pop(); while (n && !n.querySelector('button[aria-label="Add ingredients to the prompt box"]')) n = n.parentElement; return n ? { chips: n.querySelectorAll('img[alt="Ingredient image"]').length, btns: [...n.querySelectorAll('button')].map(b => b.getAttribute('aria-label') || b.innerText.trim()) } : null; })));
};
