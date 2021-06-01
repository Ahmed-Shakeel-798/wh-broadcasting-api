var webdriver = require("selenium-webdriver");

const fs = require("fs");

const { fetchUser, assignDriver } = require('../db');

const openWhatsappWeb = async (id) => {

    let myPromise = new Promise(async (myResolve, myReject) => {
        try {
            const user = fetchUser(id);
            const driver = new webdriver.Builder().forBrowser('chrome').build();
            assignDriver(user.id, driver);

            await driver.get('https://web.whatsapp.com/');
            // wait for page to load completely
            await driver.wait(async function () {
                return await driver.executeScript('return document.readyState').then(function (readyState) {
                    return readyState === 'complete';
                });
            });
            await driver.executeScript("document.body.style.zoom=0.8").then(() => { console.log("zoomed out") });
            var element = driver.findElement(webdriver.By.xpath('//*[@id="app"]/div[1]/div/div[2]/div[1]/div/a'));
            driver.executeScript("arguments[0].scrollIntoView()", element);
            driver.sleep(300);
            setTimeout(
                async () => {
                    await driver.takeScreenshot().then(
                        (output) => {
                            const outputObj = {
                                output,
                                driverId: user.id,
                                driver: driver
                            };
                            myResolve(outputObj);
                        }
                    );
                }
                , 5000);
        } catch (error) {
            throw new Error("chrome not reachable");
        }

    });

    const obj = await myPromise;
    return obj;

};

module.exports = {
    openWhatsappWeb: openWhatsappWeb,
}

