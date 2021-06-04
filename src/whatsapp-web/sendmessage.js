var webdriver = require("selenium-webdriver");
const fs = require("fs");
const { checkStatus } = require('./check_status');


const { fetchUser } = require('../db');

const sendMessageByNumber = async (contact, text, driver) => {
    let originalText = text;
    text = text.replace(/\s/g, '%20');
    console.log(text);
    const By = webdriver.By;
    return new Promise(async (myResolve, myReject) => {
        await driver.get(`https://web.whatsapp.com/send?phone=${contact}&text=${text}&app_absent=0`);
        var start = new Date().getTime();
        while (1) {
            try {
                const sendButton = await driver.findElement(By.xpath(`//*[@id="main"]/footer/div[1]/div[3]/button`));
                await sendButton.click();
                const output = {
                    contact: contact,
                    text: originalText,
                    check: true
                };
                myResolve(output);
                break;
            } catch (error) {
                var end = new Date().getTime();
                var time = end - start;
                if (time >= 10000 && time <= 12000) {
                    let should_break = false;
                    await checkStatus(driver).then((result) => {
                        if (!result.isActive) {
                            const output = {
                                message: "Your whatsapp web is not connected. Please check your phone's internet connection",
                                check: false
                            };
                            myReject(output);
                            should_break = true;
                        }
                    });
                    if (should_break) {
                        break;
                    }
                }
                if (time >= 28000) {
                    console.log(time);
                    const output = {
                        message: "Can't send message, connectivity issues.",
                        check: false
                    };
                    myReject(output);
                    break;
                }
            }
            try {
                const sendButton = await driver.findElement(By.xpath(`//*[@id="app"]/div[1]/span[2]/div[1]/span/div[1]/div/div/div/div/div[2]/div`));
                await sendButton.click();
                const output = {
                    message: "number not valid",
                    check: false
                };
                myReject(output);
                break;
            } catch (error) {
            }
        }
    });
}




module.exports = {
    sendMessageByNumber: sendMessageByNumber
}