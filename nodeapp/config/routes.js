var express = require('express');
var router = express.Router();
const homeController = require("../app/controllers/home");

/*****Api routes*********************/
router.post('/api/posts', homeController.getArticles);
module.exports = router;
