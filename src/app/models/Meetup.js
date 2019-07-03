import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Subscription, { as: 'subscription' });
    this.belongsTo(models.User, { foreingKey: 'user_id', as: 'user' });
    this.belongsTo(models.File, { foreingKey: 'file_id', as: 'file' });
  }
}

export default Meetup;
