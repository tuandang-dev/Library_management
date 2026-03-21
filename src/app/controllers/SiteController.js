const Book = require('../models/Book');
const Category = require('../models/Category');
const { mutipleMongooseToObject } = require('../../util/mongoose');

class SiteController {

    // [GET] /
    async index(req, res) {
        try {
            const [books, categories, totalCopiesResult] = await Promise.all([
                Book.find({}).populate('categoryId').lean(),
                Category.find({}).lean(),
                Book.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalCopies: { $sum: "$totalQuantity" }
                        }
                    }
                ])
            ])

            const totalCopies = totalCopiesResult.length > 0 ? totalCopiesResult[0].totalCopies : 0;

            res.render('home', {
                categories,
                books,
                totalCopies,
                layout: false
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Lỗi server!');
        }
    }

    // [GET] /search
    search(req, res, next) {

    }
}

module.exports = new SiteController();