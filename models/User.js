module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        fullName:{
            type: DataTypes.STRING,
            allowNull: false,
            validate:{
                notEmpty: true
            }
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate:{
                notEmpty: true
            },
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate:{
                notEmpty: true
            },

            
        },

        allowed:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            validate:{
                notEmpty: true
            },
        },

        admin:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate:{
                notEmpty: true
            },
        }
    });

    return User;
}