class User {
    constructor(id) {
        this.id = id;
        this.isAssigned = false;
    }

    assignDriver(driver) {
        this.driver = driver;
        this.isAssigned = true;
    };

    deleteDriver() {
        this.driver.close();
        this.driver = null;
        this.isAssigned = false;
    }

    isUser(id) {
        if (id == this.id) {
            return true;
        } else {
            return false;
        }
    }

    getId() {
        return this.id;
    }

    getDriver() {
        return this.driver;
    }

}

let users = [];

let createNewUser = () => {
    if (users.length >= 100) {
        return 404;
    }
    while (1) {
        var x = Math.floor((Math.random() * 100) + 1);
        let alreadyEXISTS = false;
        for (let i = 0; i < users.length; i++) {
            if (users[i].getId() == x) {
                alreadyEXISTS = true;
            }
        }
        if (!alreadyEXISTS) {
            let newUser = new User(x);
            users.push(newUser);
            return newUser.id;
        }
    }
}

let fetchUser = (id) => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].getId() == id) {
            // console.log("found ----------------------");
            return users[i];
        }
    }
}

let assignDriver = (id, driver) => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].getId() == id) {
            users[i].assignDriver(driver);
        }
    }
}

let deleteDriver = (id) => {

    const user = fetchUser(parseInt(id));
    if (!user) {
        throw new Error("user not found, please create a new user");
    }
    if (!user.isAssigned) {
        throw new Error("session does not exist, please initialize")
    }
    user.deleteDriver();

}

let getAllUsers = () => {
    return users;
}

module.exports = {
    createNewUser,
    getAllUsers,
    fetchUser,
    assignDriver,
    deleteDriver
}
