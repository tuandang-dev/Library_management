const Course = require('../models/Course_temp');
const { mutipleMongooseToObject } = require('../../util/mongoose');

class SiteController {

    // [GET] /
    index(req, res, next) {

        Course.find({})
        .then(courses => {
            res.render('home', {
                courses: mutipleMongooseToObject(courses)
            })
        })
        .catch(next)
    }

    // [GET] /search
    search(req, res) {
        res.render('search')
    }
}

module.exports = new SiteController;