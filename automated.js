const puppeteer = require('puppeteer');

(async () => {
  // Launch the browser
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();

  // Navigate to the form page
  await page.goto('http://localhost:3000');

  // Submit a sample message
  await page.type('textarea[name="message"]', 'Test message');
  await page.click('button[type="submit"]');
  console.log('Message submitted.');

  // Verify that the message is displayed on the message list page
  await page.goto('http://localhost:3000/messages');
  console.log('Navigated to the message list page.');
  const isMessageDisplayed = await page.evaluate(() => {
    const messageList = Array.from(document.querySelectorAll('li'));
    return messageList.some(li => li.textContent.includes('Test message'));
  });

  if (isMessageDisplayed) {
    console.log('Message is displayed on the message list page.');
  } else {
    console.log('Message is not displayed on the message list page.');
  }

  // Delete the message
  await page.evaluate(() => {
    const deleteButton = document.querySelector('button');
    deleteButton.click();
    console.log('Message deleted.');
  });
  await page.waitForNavigation();

  // Close the browser
  await browser.close();
})();
