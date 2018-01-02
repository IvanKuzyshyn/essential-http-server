import puppeteer from 'puppeteer';
import path from 'path';

import EssentialHttpServer from '../../src/essential-http-server';

const port = 3001;
const server = new EssentialHttpServer({
    rootDir: path.resolve(__dirname, '../../public/'),
    port,
});
const sitePath = `http://localhost:${port}`;

server.start(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    await page.goto(sitePath);
    await page.click('a');
    await page.goto(`${sitePath}/no-page.html`);

    browser.close();
});
