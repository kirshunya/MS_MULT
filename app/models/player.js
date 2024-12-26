class PlayerData {
    constructor(login, password, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0 }) {
        this.login = login;
        this.password = password;
        this.position = position;
        this.rotation = rotation;
    }
}

module.exports = { PlayerData };
