var fs = require('fs');
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

let isFirst = true;
let users = [];
let user_ids = [];

let createNewUser = () => {
    if (isFirst) {
        initializeUsersFromDB();
        isFirst = false;
    }

    if (users.length >= 100) {
        return 404;
    }
    // generating a new id
    while (1) {
        let id = '';
        for (let i = 0; i < 8; i++) {
            var x = Math.floor((Math.random() * 10));
            id = id + x;
        }
        let alreadyEXISTS = false;
        for (let i = 0; i < users.length; i++) {
            if (users[i].getId() == id) {
                alreadyEXISTS = true;
            }
        }
        if (!alreadyEXISTS) {
            let newUser = new User(id);
            users.push(newUser);
            insertIdIntoDB(newUser.id);
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

    const user = fetchUser(id);
    if (!user) {
        throw new Error("user not found, please create a new user");
    }
    if (!user.isAssigned) {
        throw new Error("session does not exist, please initialize")
    }
    user.deleteDriver();

}

let deleteUser = (id) => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].getId() == id) {
            users.splice(i, 1);
            user_ids.splice(i, 1);
            var json = JSON.stringify(user_ids);
            fs.writeFileSync('./data.json', json);
        }
    }
}

let getAllUsers = () => {
    return users;
}

let initializeUsersFromDB = () => {
    const dataBuffer = fs.readFileSync('./data.json');
    const dataJSON = dataBuffer.toString();
    user_ids = JSON.parse(dataJSON);
    // console.log("here");
    for (let i = 0; i < user_ids.length; i++) {
        let newUser = new User(user_ids[i]);
        console.log(`created ${newUser.id} from DB`)
        users.push(newUser);
    }
}

let insertIdIntoDB = (id) => {
    const dataBuffer = fs.readFileSync('./data.json');
    const dataJSON = dataBuffer.toString();
    user_ids = JSON.parse(dataJSON);
    user_ids.push(id)
    var json = JSON.stringify(user_ids);
    fs.writeFileSync('./data.json', json);
}

module.exports = {
    createNewUser,
    getAllUsers,
    fetchUser,
    assignDriver,
    deleteDriver,
    deleteUser,
}


