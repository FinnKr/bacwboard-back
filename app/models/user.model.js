module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        mail: {
            type: Sequelize.STRING,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        role: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    
    return User;
}