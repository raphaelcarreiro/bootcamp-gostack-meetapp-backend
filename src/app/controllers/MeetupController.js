import * as Yup from 'yup';
import { isBefore, parseISO, endOfDay, startOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import File from '../models/File';
import User from '../models/User';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class MeetupController {
  async index(req, res) {
    const page = req.query.page ? req.query.page : 1;
    const { date } = req.query;
    const where = {};

    if (date) {
      const parsedDate = parseISO(date);
      where.date = {
        [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
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
        {
          model: File,
          as: 'file',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return res.json(meetups);
  }

  async show(req, res) {
    const { id } = req.params;

    const meetup = await Meetup.findByPk(id, {
      include: [
        {
          model: File,
          as: 'file',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    if (!meetup) {
      return res.status(404).json({
        error: 'Meetup not found',
      });
    }

    return res.json(meetup);
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
    const meetup = await Meetup.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });

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

    await Queue.add(CancellationMail.key, { meetup });

    const { id, title, description, location, user_id, user, file_id } = meetup;

    return res.json({
      id,
      title,
      description,
      location,
      user_id,
      user,
      file_id,
    });
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

    const { title, description, location, date, file_id } = await meetup.update(
      {
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        location: req.body.location,
        fileId: req.body.file_id,
      }
    );

    return res.json({
      title,
      description,
      location,
      date,
      file_id,
    });
  }
}

export default new MeetupController();
