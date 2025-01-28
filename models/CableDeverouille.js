module.exports = (sequelize, DataTypes) => {
    const CableDeverouille = sequelize.define("CableDeverouille", {
        cargo:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        niveau:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3
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
