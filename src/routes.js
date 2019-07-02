import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import FileController from './app/controllers/FileController';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import MeetupController from './app/controllers/MeetupController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.authenticate);

routes.use(authMiddleware);

routes.put('/users', UserController.update);
routes.post('/users', UserController.store);

routes.post('/meetups', MeetupController.store);
routes.put('/meetups', MeetupController.update);
routes.delete('/meetups', MeetupController.destroy);
routes.get('/meetups', MeetupController.index);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
