const User = require('../models/user');
const Blog = require('../models/blog');
const _ = require('lodash');
const formidable = require('formidable');
const fs = require('fs');
const { errorHandler } = require('../helpers/dbErrorHandler');


exports.read = (req, res) => {
    req.profile.hashed_password = undefined;
    return res.json(req.profile);
};

exports.publicProfile = (req, res) => {
    let username = req.params.username
    let user
    let blogs

    User.findOne({username}).exec((err, userFromDB) => {
        if(err || !userFromDB) {
            return res.status(400).json({
                error: 'User not found'
            })
        }
        user = userFromDB
        let userId = user._id
        Blog.find({postedBy: userId})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name email about')
        .limit(10)
        .select('_id title slug postedBy')
        .exec((err, data) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            user.photo = undefined;
            user.hashed_password = undefined;
            user.salt = undefined;
            res.json({
                user, blogs: data
            });
        });

    })
}

exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if(err) {
            return res.status(400).json({
                error: 'Photo could not be uploaded!'
            })
        }
        let user = req.profile
        user = _.extend(user, fields)

        if(fields.password && fields.password.length < 6) {
            return res.status(400).json({
                error: 'Password should be atleast 6 characters long!'
            });
        }

        if(fields.about && fields.about.length > 100) {
            return res.status(400).json({
                error: 'About should be in only 100 characters!'
            });
        }

        if(files.photo) {
            if(files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1 mb!'
                })
            }
            user.photo.data = fs.readFileSync(files.photo.path)
            user.photo.contentType = files.photo.type
        }

        user.save((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            user.photo = undefined;
            res.json(user)
        })
    });
};

exports.photo = (req, res) => {
    const username = req.params.username
    User.findOne({username}).exec((err, user) => {
        if(err || !user) {
            return res.status(400).json({
                error: 'User not found'
            })
        }
        if(!user.photo.data) {
            console.log(__dirname);
            return res.sendFile(__dirname + '/static/default-profile.png');
        }
        if(user.photo.data) {
            res.set('Content-Type', user.photo.contentType);
            return res.send(user.photo.data);
        }
    })
}