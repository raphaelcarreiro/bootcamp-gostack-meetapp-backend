import Meetup from '../models/Meetup';

class OrganizerController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: [
        'id',
        'title',
        'description',
        'location',
        'file_id',
        'user_id',
        'date',
      ],
    });

    return res.json(meetups);
  }
}
export default new OrganizerController();
