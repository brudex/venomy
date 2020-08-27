const express = require('express');
const router = express.Router();
const db = require('../models');

const HomeController = {};
module.exports = HomeController;

HomeController.getArticles = (req,res) => {
  db.Article.findAll().then((articles) => {
    res.render('index', {
      title: 'Generator-Express MVC',
      articles: articles
    });
  });
}

module.exports = HomeController;
