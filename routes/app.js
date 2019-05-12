const express = require('express');
const router = express.Router();
const array = ['a', 'b', 'c'];
router.get('/', (req, res) => {
    res.render('genres', {
        title: 'Genres',
        header: 'Genres',
        text: 'some lengthy text',
        array: array
    });
});

module.exports = router;