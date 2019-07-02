import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const page = req.query.page ? req.query.page : 1;

    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
      order: ['date'],
      attributes: ['id', 'title', 'description', 'location', 'date', 'file_id'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
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
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(404).json({
        error: 'Meetup not found',
      });
    }

    if (meetup.userId !== req.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({
        error: 'It is not possible to delete a past meetup',
      });
    }

    await meetup.destroy();

    return res.json();
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation has failed' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup)
      if (req.userId !== meetup.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

    if (isBefore(meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: 'It is not possible update a past meetup' });
    }

    const { title, description, location, date } = await meetup.update(
      req.body
    );

    return res.json({
      title,
      description,
      location,
      date,
    });
  }
}

export default new MeetupController();
