module.exports = (sequelize, DataTypes) => {
    const candidate_summary = sequelize.define("candidate_summary", {
        candidate_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        candidates_data: {
            type: DataTypes.JSONB
        },
        created_by: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },{
        freezeTableName: true,
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        id: 'candidate_id'
    });
  
    return candidate_summary;
  };