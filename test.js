const { Builder, By, Assert, Key, until } = require('selenium-webdriver')
const assert = require('assert/strict');

const driver = new Builder().forBrowser('chrome').build();

(async function simpleExpense() {
    await driver.get('file:///C:/Users/User/Programmierung/Webentwicklung/expenses/expenses.html');
    await driver.findElement(By.id('description')).sendKeys('Test');
    await driver.findElement(By.id('amount')).sendKeys('15.05', Key.chord(Key.CONTROL, Key.ENTER));
    await driver.wait(until.elementIsVisible(driver.findElement(By.css('div#day-expenses table tr:not([class]) td'))));
    const text = await driver.findElement(By.css('div#day-expenses table tr:not([class]) td')).getText();
    assert.equal(text, 'Test');
    driver.quit();
})();
