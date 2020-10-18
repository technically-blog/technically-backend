const Category = require('../models/category');
const Blog = require('../models/blog');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');
const formidable = require('formidable');
const fs = require('fs');

exports.create = (req, res) => {
    let form = new formidable.IncomingForm(); //formidable
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {

        if (err) {
            return res.status(400).json({
                error: 'Image could not upload'
            });
        }

        const { name, info } = fields;
        if (!name || name.length===0) {
            return res.status(400).json({
                error: 'Name is required!'
            });
        }

        if (!info || !info.length) {
            return res.status(400).json({
                error: 'Category Information is required!'
            });
        }

        let category = new Category();

        category.name = name;
        category.slug = slugify(name).toLowerCase();
        category.info = info;

        if(!files.image) {
            return res.status(400).json({
                error: 'Adding Category Image is mandatory!'
            });
        }

        if (files.image) {
            if (files.image.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            category.image.data = fs.readFileSync(files.image.path);
            category.image.contentType = files.image.type;
        }

        category.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

exports.list = (req, res) => {
    Category.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Category.findOne({ slug }).exec((err, category) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        // res.json(category);
        Blog.find({ categories: category })
            .populate('categories', '_id name slug info')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username')
            .select('_id title slug gist categories postedBy tags createdAt updatedAt')
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                Blog.find({ categories: category })
                .sort({'updatedAt': -1})
                .limit(2)
                .populate('postedBy', '_id name username')
                .select('title slug postedBy createdAt updatedAt')
                .exec((err, topThree) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Blogs not found'
                        });
                    }
                    res.json({ category: category, blogs: data, trendingBlogs: topThree });
                });
            });
    });
};


exports.image = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Category.findOne({ slug })
        .select('image')
        .exec((err, category) => {
            if (err || !category) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', category.image.contentType);
            return res.send(category.image.data);
        });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Category.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Category deleted successfully'
        });
    });
};

exports.trending = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Category.findOne({ slug }).exec((err, category) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        
        Blog.find({ categories: category })
        .sort({'updatedAt': -1})
        .limit(2)
        .populate('postedBy', '_id name username')
        .select('title slug postedBy createdAt updatedAt')
        .exec((err, blogs) => {
            if (err) {
                return res.status(400).json({
                    error: 'Blogs not found'
                });
            }
            res.json(blogs);
        });

    });
};