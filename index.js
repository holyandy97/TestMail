const puppeteer = require('puppeteer');
const faker = require('faker');


async function mailingTest() {
  const browser = await puppeteer.launch({headless: false, defaultViewport: null});
  const page = await browser.newPage();
  // logging to ukr.net account
  await page.goto("https://accounts.ukr.net/login?client_id=9GLooZH9KjbBlWnuLkVX#settings/account",{waitUntil:"networkidle2"});
  await page.type("#id-l","asferroisthebestcompany",{delay:30});
  await page.type("#id-p", "asferro2020", {delay:30});
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil:"networkidle2"});
  
  //mailing 10 letters
  for(let i = 1; i<=10; i++){
    await page.click('button[class="default compose"]');
    await page.type('input[name="toFieldInput"]', "asferroisthebestcompany@ukr.net");
    await page.type('input[name="subject"]', faker.name.lastName().slice(0, 5)+faker.address.zipCode().slice(0, 5));
    await page.waitForSelector('iframe');
    const elementHandle = await page.$('iframe[src="about:blank"]',);
    const frame = await elementHandle.contentFrame();
    await frame.type('#tinymce', faker.name.lastName().slice(0, 5)+faker.address.zipCode().slice(0, 5));
    await page.click('button[class="default send"]');
    await page.waitForNavigation({ waitUntil:"networkidle2"});
    await page.click('button[class="default"]');
  }
  await page.click('a[class="controls-link cancel"]');

  //collect message text and save to array
  const dataList = await page.evaluate( () => Array.from( document.querySelectorAll( 'a[class="msglist__row_href"]' ), element => element.textContent) );
  let tmpList = [];

  for(let i = 0; i<=dataList.length-2; i++){
    var str = dataList[i].split('  '); 
    tmpList.push([str[0], str[1]]);
  }
  //Verify that all 10 messages are delivered
  if(tmpList.length == 10){
    console.log('All 10 messages are delivered')
  }else{
    console.log(`Error. Count of delivered messages is ${tmpList.length}`)
  }
  
  //save data messages from array to object
  const dataObject = {}
  for (var i = 0; i < tmpList.length; ++i){
    dataObject[tmpList[i][0]] = String(tmpList[i][1]).trimEnd()
  }

  var text = '';
  for (const [key, value] of Object.entries(dataObject)) {
    text += `Recived mail on theme "${key}" with message: ${value}. It contains ${value.replace(/[^A-Z]/gi, "").length} leters and
    ${value.length-value.replace(/\d/gm,'').length} numbers\n`;
  }
  //mailing received data messages
  await page.click('button[class="default compose"]');
  await page.type('input[name="toFieldInput"]', "asferroisthebestcompany@ukr.net");
  await page.type('input[name="subject"]', "Report");
  await page.waitForSelector('iframe');
  const elementHandle = await page.$('iframe[src="about:blank"]',);
  const frame = await elementHandle.contentFrame();
  await frame.type('#tinymce', text);
  await page.click('button[class="default send"]');
  await page.waitForNavigation({ waitUntil:"networkidle2"});
  await page.goto("https://mail.ukr.net/desktop",{waitUntil:"networkidle2"});

  // delete messages
  await page.click('label[class="checkbox"]')
  const elements = await page.$x('//tbody/tr[1]/td[1]');
  await elements[0].click();
  await page.click('a[class="controls-link remove"]')

  await browser.close()
}

mailingTest()