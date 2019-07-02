import { isBefore, startOfHour, endOfHour } from 'date-fns';
import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';

class SubscriptionController {
  async store(req, res) {
    const meetUp = await Meetup.findByPk(req.params.meetUpId);

    if (!meetUp) {
      return res.status(404).json({ error: 'MeetUp not found' });
    }

    if (meetUp.userId === req.userId) {
      return res
        .status(401)
        .json({ error: 'It not possible to subscribe in your own meetUp' });
    }

    if (isBefore(meetUp.date, new Date())) {
      return res
        .status(401)
        .json({ error: 'It not possible to subscribe in a past meetUp' });
    }

    let subscription = await Subscription.findOne({
      where: {
        meetup_id: req.params.meetUpId,
        user_id: req.userId,
      },
    });

    if (subscription) {
      return res
        .status(401)
        .json({ error: 'It not possible to subscribe twice in a meetUp' });
    }

    subscription = await Subscription.findOne({
      where: {
        user_id: req.userId,
        [Op.between]: [startOfHour(meetUp.date), endOfHour(meetUp.date)],
      },
    });

    if (subscription) {
      return res.status(401).json({
        error:
          'It not possible to subscribe in a meetUp that take places in the same hour',
      });
    }

    const { id } = await Subscription.create({
      meetup_id: meetUp.id,
      user_id: req.userId,
    });

    return res.json({ id });
  }
}

export default new SubscriptionController();
