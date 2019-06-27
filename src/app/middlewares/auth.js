import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth';

function auth(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Token not provide' });
  }

  const [, token] = authorization.split(' ');

  try {
    const decoded = jwt.verify(token, authConfig.secret);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.json({ error: 'Invalid token' });
  }
}

export default auth;
