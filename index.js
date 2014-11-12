var request = require('request');
var Q = require('q');
var extend = require('util-extend');
var crypto = require("crypto");

var default_options = {
    merchantId: "13466",
    merchantSecret: "6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ",
};
var default_urls = {
    paymentCreate: "https://payment.paytrail.com/api-payment/create"
}




module.exports = function (options, urls) {
    this.options = extend(default_urls, options);
    this.urls = extend(default_urls, urls);
    this.products = [];
    if (!this.urls.success
        || !this.urls.failure
        || !this.urls.notification) { throw new Error("Callback urls must be defined!"); };
    // Default method for creating payments
this.APIRequest = function APIRequest (url, body) {
    var deferred = Q.defer();
    var r = {
        method: 'POST',
        uri: url,
        auth: {
            username: this.options.merchantId,
            password: this.options.merchantSecret
        },
        headers: {
            'User-Agent': 'node-paytrail',
            'X-Verkkomaksut-Api-Version': 1
        },
        json: true,
        body: body
    }
    request(r, function(error, response, body){
        if (error) {
            deferred.reject(error);
            return;
        }
        deferred.resolve(body);
    });
    return deferred.promise;
};
this.addProduct = function (product) {
    var product_default = {
        title: "Product",
        amount: 1,
        price: 0.65,
        vat: 24,
        discount: 0,
        type: 1
    };
    product = extend(product_default, product);
    this.products.push(product);
}
    // sets contact information
    this.setContact = function (required, address, optionals) {
        data = {address:{}};
        data = required;
        data.address = address;
        data = extend(data, optionals);
        if (!("firstName" in data)) throw new Error("firstName is required");
        if (!("lastName" in data)) throw new Error("firstName is required");
        if (!("email" in data)) throw new Error("email is required");
        if (!("street" in data.address)) throw new Error("street is required");
        if (!("postalCode" in data.address)) throw new Error("postalCode is required");
        if (!("postalOffice" in data.address)) throw new Error("postalOffice is required");
        if (!("country" in data.address)) throw new Error("country is required");
        this.contact = data;
    }
    // creates and processes payment
    this.createPayment = function (payment) {
        var payment_defaults = {
            orderNumber: "",
            referenceNumber: "",
            description: "",
            currency: "EUR",
            locale: "fi_FI",
            urlSet: this.urls,
            orderDetails: {
                includeVat: 1,
                contact: this.contact,
                products: this.products
            }
        };
        payment = extend(payment_defaults, payment);
        return this.APIRequest(this.urls.paymentCreate, payment); 
    };
    this.confirmSuccess = function (orderNumber, timestamp, paid, method, authCode) {
        return this.confirmParams([orderNumber, timestamp, paid, method, this.options.merchantSecret], authCode);
    };
    this.confirmFailure = function (orderNumber, timestamp, authCode) {
        return this.confirmParams([orderNumber, timestamp, this.options.merchantSecret], authCode);
    }
    this.confirmParams = function (array, authCode) {
        var base = array.join('|');     
        var hash = crypto.createHash("md5").update(base).digest("hex");
        return hash.toUpperCase() === authCode;
    }
    return this;

}