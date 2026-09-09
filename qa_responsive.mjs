// QA Script: Capture screenshots at multiple viewport sizes
export default async function run(page, ui) {
  const viewports = [
    { name: 'mobile_sm',  width: 375,  height: 812  }, // iPhone SE/12
    { name: 'mobile_lg',  width: 414,  height: 896  }, // iPhone XR
    { name: 'tablet',     width: 768,  height: 1024 }, // iPad
    { name: 'desktop',    width: 1280, height: 800  }, // Laptop
    { name: 'wide',       width: 1920, height: 1080 }, // Full HD
  ];

  const pages = [
    { path: '/',         name: 'home'     },
    { path: '/login',    name: 'login'    },
    { path: '/search',   name: 'search'   },
    { path: '/property/6a90a916f2ac5f63a73dd617', name: 'property' },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const pg of pages) {
      await page.goto(`http://localhost:5173${pg.path}`);
      // Wait for real content
      try {
        await page.waitForFunction(() => document.body.innerText.trim().length > 100, { timeout: 8000 });
      } catch {}
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `C:\\Users\\HP\\Documents\\EasySTAY\\qa_resp_${vp.name}_${pg.name}.png`,
        fullPage: false
      });
    }
  }

  return { done: true, captured: viewports.length * pages.length };
}
