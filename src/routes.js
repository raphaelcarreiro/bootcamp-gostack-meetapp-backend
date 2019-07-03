import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import FileController from './app/controllers/FileController';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';
import OrganizerController from './app/controllers/OrganizerController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.authenticate);
routes.post('/users', UserController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.destroy);
routes.get('/meetups', MeetupController.index);

routes.get('/subscriptions', SubscriptionController.index);
routes.post('/subscriptions/:meetUpId', SubscriptionController.store);

routes.get('/organizer/meetups', OrganizerController.index);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
