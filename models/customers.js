const mongoose = require("mongoose");
const custSchema = new mongoose.Schema({
    isGold: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    phone: {
        type: String,
        required: true,
        minlength: 8
    }
});

const Customer = mongoose.model('Customer', custSchema);

async function getCustomers(id) {
    if (id) return await Customer.findById(id);
    return await Customer.find()
}

async function insertCustomer(cust) {
    const customer = new Customer({
        isGold: cust.isGold,
        name: cust.name,
        phone: cust.phone
    });
    return await customer.save();
}

async function updateCustomer(id, obj) {
    return await Customer.findByIdAndUpdate(id, obj, {
        new: true
    });
}

async function deleteCustomer(id) {
    return await Customer.findByIdAndDelete(id);
}

module.exports.get = getCustomers;
module.exports.set = insertCustomer;
module.exports.update = updateCustomer;
module.exports.delete = deleteCustomer;
