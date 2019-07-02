import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';

class MeetupController {
  async index(req, res) {
    const { page } = req.query;

    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
      order: ['data'],
      attributes: [
        'title',
        'description',
        'location',
        'date',
        'user_id',
        'banner_id',
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      user_id: Yup.number().required(),
      file_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation has failed' });
    }

    const { title, description, location, date, file_id } = req.body;

    const parsedDate = parseISO(date);

    if (isBefore(parsedDate, new Date())) {
      return res.status(400).json({
        error: 'It not possible to create an event on past date',
      });
    }

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      userId: req.userId,
      fileId: file_id,
    });

    return res.json(meetup);
  }

  async destroy(req, res) {
    return res.json();
  }

  async update(req, res) {
    return res.json();
  }
}

export default new MeetupController();
