const mongoose = require('mongoose');
const { seedAdmin } = require('../../app/services/seeder');

async function connect() {

    try {

        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Connect successfully!!!');
        await seedAdmin();

    } catch (error) {
        console.log('Connect failure!!!');
        throw error;
    }

}

module.exports = { connect };