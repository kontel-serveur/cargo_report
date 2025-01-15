module.exports = (sequelize, DataTypes) => {
    const CableDeverouille = sequelize.define("CableDeverouille", {
        cargo:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        dateCoupure:{
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },

        heureCoupure: {
            type: DataTypes.TIME,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },

    });

    return CableDeverouille;
};
