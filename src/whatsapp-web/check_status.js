var webdriver = require("selenium-webdriver");

const checkStatus = async (driver) => {
    const By = webdriver.By;
    return new Promise(async (myResolve, myReject) => {
        try {
            console.log("checking status .....")
            const searchContact = await driver.findElement(By.xpath('//*[@id="side"]/div[1]/div/label/div/div[2]'));
            if (searchContact) {
                const output = {
                    isActive: true
                }
                myResolve(output);
            }
        } catch (error) {
            const output = {
                isActive: false
            }
            myResolve(output);
        }
    })
}

module.exports = {
    checkStatus
}