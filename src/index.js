const express = require("express");
var webdriver = require("selenium-webdriver");
const fs = require("fs");
const path = require("path")

const { openWhatsappWeb } = require('./whatsapp-web/initialize');
const { sendMessage, sendMessageByNumber } = require('./whatsapp-web/sendmessage');
const { checkStatus } = require('./whatsapp-web/check_status');
const { createNewUser, fetchUser, deleteDriver, deleteUser, toggleQrScannedStatus } = require('./db');
const { fillArray, popMessage, getCurrentMessagesArray } = require('./messages-queue');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


var driver;

// craetes a new user id & return it
app.post('/createUser', async (req, res) => {
    try {
        const driverId = createNewUser();
        console.log(driverId);
        if (driverId == 404) {
            throw new Error
        }
        res.set("id", `${driverId}`);
        res.status(200).send({ result: "success" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ status: "Failed!", error: error.message });
    }
});

app.get('/initialize', async (req, res) => {
    try {
        var id = req.query.id;
        const user = fetchUser(id);
        if (!user) {
            throw new Error("no such user, please create a new user");
        }
        if (user.isAssigned) {
            deleteDriver(req.query.id);
        }
        await openWhatsappWeb(req.query.id).then(
            (outputObj) => {
                driverId = outputObj.driverId;
                driver = outputObj.driver;
                fs.writeFileSync(`./src/${driverId}.png`, outputObj.output, 'base64');
                const filePath = path.join(__dirname, `/${driverId}.png`);
                res.set("id", `${driverId}`);
                res.sendFile(filePath);
                setTimeout(async () => {
                    fs.unlink(`./src/${driverId}.png`, (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("File is deleted.");
                    });
                }, 1000);
                driver.executeScript("document.body.style.zoom=1.0").then(() => { console.log("zoomed out") });
                toggleQrScannedStatus(id, false);
            }
        );


    } catch (error) {
        console.log(error.message);
        res.status(500).send({ status: "Failed!", error: error.message });
    }
})

app.get('/check_status', async (req, res) => {
    try {
        var id = req.query.id;
        const user = fetchUser(id);
        if (!user) {
            throw new Error("no such user, please create a new user");
        }
        if (!user.isAssigned) {
            throw new Error("session offline, please initialize ");
        }
        if (!user.hasScanned) {
            throw new Error("QR code not scannned yet, please initialize");
        }
        let driver = user.driver;
        await checkStatus(driver).then((result) => {
            if (result.isActive) {
                res.status(200).send({ result: "success", message: "active" });
            } else {
                res.status(200).send({ result: "success", message: "not_active" });
            }
        });


    } catch (error) {
        console.log(error.message)
        res.status(500).send({ status: "Failed!", error: error.message });
    }
});

app.get('/qr_status', async (req, res) => {
    try {
        var id = req.query.id;
        const user = fetchUser(id);
        if (!user) {
            throw new Error("no such user, please create a new user");
        }
        if (!user.isAssigned) {
            throw new Error("session offline, please initialize ");
        }
        let driver = user.driver;
        await checkStatus(driver).then((result) => {
            if (result.isActive) {
                toggleQrScannedStatus(id, true);
                console.log(user.hasScanned);
                res.status(200).send({ result: "success", message: "scanned" });
            } else {
                toggleQrScannedStatus(id, false);
                console.log(user.hasScanned);
                res.status(200).send({ result: "success", message: "not scanned" });
            }
        });

    } catch (error) {
        console.log(error.message)
        res.status(500).send({ status: "Failed!", error: error.message });
    }

})

app.post('/sendMessageTextOnly/:id', async (req, res) => {
    try {
        var id = req.params.id;
        const user = fetchUser(id);
        if (!user) {
            throw new Error("no such user, please create a new user");
        }
        if (!user.isAssigned) {
            throw new Error("session offline, please initialize ");
        }
        let driver = user.driver;

        await sendMessageByNumber(req.body.contact, req.body.text, driver).then((output) => {
            if (output.check) {
                res.send({ status: "Success", sent_to: output.contact, text: output.text });
                check = output.check;
                // driver.navigate().refresh();
            }
        });

    } catch (error) {
        console.log(error.message)
        res.status(500).send({ status: "Failed!", error: error.message });
    }
});

app.delete('/logout', (req, res) => {
    try {
        deleteDriver(req.query.id);
        res.status(200).send({ result: "logged out" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ status: "Failed!", error: error.message });
    }
});

app.delete('/delete_user', (req, res) => {
    try {
        var id = req.query.id;
        const user = fetchUser(id);
        if (!user) {
            throw new Error("no such user, please create a new user");
        }
        if (!user.isAssigned) {
            deleteUser(req.query.id);
        } else {
            deleteDriver(req.query.id);
            deleteUser(req.query.id);
        }


        res.status(200).send({ result: "user deleted" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ status: "Failed!", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`server up and running on PORT: ${PORT}`);
});