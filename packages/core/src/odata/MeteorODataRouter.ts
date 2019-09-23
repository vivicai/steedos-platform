import { Response } from 'express';
import steedosAuth = require("@steedos/auth");
import { meteorODataExpressMiddleware } from './MeteorODataExpressMiddleware';
var express = require('express');
var router = express.Router();

import * as core from "express-serve-static-core";
interface Request extends core.Request {
  user: any;
}

router.use('/:spaceId', steedosAuth.setRequestUser);

// middleware that is specific to this router
router.use('/:spaceId', function (req: Request, res: Response, next: () => void) {
  if (req.user) {
    next();
  }
  else {
    res.status(401).send({ status: 'error', message: 'You must be logged in to do this.' });
  }
})

/*
在odata接口中处理
  1. space级 下增，删，改，查权限
  2. company级 下增，删，改，查权限
  3. 记录级权限：
    owner(记录所有者)处理
*/

router.get('/:spaceId/:objectName', meteorODataExpressMiddleware.getObjectList);

router.get('/:spaceId/:objectName/recent', meteorODataExpressMiddleware.getObjectRecent);

router.post('/:spaceId/:objectName', meteorODataExpressMiddleware.createObjectData);

router.get('/:spaceId/:objectName/:_id', meteorODataExpressMiddleware.getObjectData);

router.put('/:spaceId/:objectName/:_id', meteorODataExpressMiddleware.updateObjectData);

router.delete('/:spaceId/:objectName/:_id', meteorODataExpressMiddleware.deleteObjectData);

router.post('/:spaceId/:objectName/:_id/:methodName', meteorODataExpressMiddleware.excuteObjectMethod);

export default router