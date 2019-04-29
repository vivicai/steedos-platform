import crypto = require('crypto');
import { getSteedosSchema } from '@steedos/objectql';

const sessions = {};

function _hashLoginToken(token: string) {
  const hash = crypto.createHash('sha256');
  hash.update(token);
  return hash.digest('base64');
}

function isExpried(expiredAt: number) {
  return expiredAt <= new Date().getTime();
}

function reovkeSessionFromCache(token: string) {
  return delete sessions[token];
}

export function addSessionToCache(token: string, session: object) {
  sessions[token] = session;
}

export function getSessionFromCache(token: string) {
  let session = sessions[token];
  if (!session) {
    return null;
  }
  if (isExpried(session.expiredAt)) {
    reovkeSessionFromCache(session.token);
    return null;
  }
  return session;
}

export async function getSession(userId: any, token: string, sessionCacheInMinutes: number = 10) {
  if (getSessionFromCache(token)) {
    return getSessionFromCache(token);
  } else {
    let hashedToken = _hashLoginToken(token);
    let filters = `(_id eq '${userId}') and ('services.resume.loginTokens.hashedToken' eq '${hashedToken}')`;
    let user = await getSteedosSchema().getObject('users').find({ filters: filters, fields: ['name', 'steedos_id', 'email'] });
    console.log('user[0]: ', user[0])
    let session = { name: user[0].name, userId: user[0]._id, steedos_id: user[0].steedos_id, email: user[0].email, token: token, expiredAt: new Date().getTime() + sessionCacheInMinutes * 60 * 1000 };
    addSessionToCache(token, session)
    return session
  }

}