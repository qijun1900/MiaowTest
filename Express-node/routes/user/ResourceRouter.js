var express = require("express");
const ResourceController = require("../../controllers/user/ResourceController");
const JWT = require("../../MiddleWares/jwt");
var ResourceRouter = express.Router();

/**
 * @swagger
 * /uniappAPI/resource/user/getResourceList:
 *   post:
 *     tags: [用户-资源]
 *     summary: 通过业务标签获取资源
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tag:
 *                 type: string
 *                 description: 业务标签
 *     responses:
 *       200:
 *         description: 成功
 */
//通过业务标签获取资源
ResourceRouter.post(
  "/uniappAPI/resource/user/getResourceList",
  JWT.verifyTokenMiddleware(),
  ResourceController.getResourceList,
);

module.exports = ResourceRouter;
