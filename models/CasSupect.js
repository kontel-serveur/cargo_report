module.exports = (sequelize, DataTypes) => {
    const CasSuspect = sequelize.define("CasSuspect", {

        cargo:{
            type: DataTypes.INTEGER,
            allowNull: false
        },

        commentaire: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },

    });

    return CasSuspect;
};
