const mongoose = require('mongoose');
const { seedAdmin } = require('../../app/services/seeder');

async function connect() {

    try {

        await mongoose.connect('mongodb://127.0.0.1:27017/library-management');

        console.log('Connect successfully!!!');
        seedAdmin();

    } catch (error) {
        console.log('Connect failure!!!');
    }

}

module.exports = { connect };