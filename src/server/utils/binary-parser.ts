import { Request } from 'supertest';

export const binaryParser: Parameters<Request['parse']>[0] = (res, cb) => {
  res.setEncoding('binary');
  res.body = '';
  res.on('data', function (chunk) {
    res.body += chunk;
  });
  res.on('end', function () {
    cb(null, Buffer.from(res.body, 'binary'));
  });
};
