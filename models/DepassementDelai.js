module.exports = (sequelize, DataTypes) => {
    const DepassementDelai = sequelize.define("DepassementDelai", {

        cargo:{
            type: DataTypes.INTEGER,
            allowNull: false
        },

        observation: {
            type: DataTypes.JSON, // Use JSON data type for an array of objects
            allowNull: false,
            defaultValue: [],
        },

    });

    return DepassementDelai;
};
