

var options = {
	merchantId: "13466",
	merchantSecret: "6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ",
}
var urls =  {
	success: "https://example.com/payment/success",
	failure: "https://example.com/payment/failure",
	notification: "https://example.com/payment/notify"
};

var paytrail = require('../index')(options, urls);


paytrail.addProduct({title:"Product 1", amount:2, price: 14.56, vat: 24});
paytrail.addProduct({title:"Product 2", amount:1, price: 20.00, vat: 24});
paytrail.addProduct({title:"Product 3", amount:6, price: 3.10, vat: 24});


paytrail.setContact({
	email: "testaaja@esimerkkikauppa.fi",
	firstName: "Simo",
	lastName: "Verkkokauppias",
}, {
	street: "Testikatu 1",
	postalCode: "12340",
	postalOffice: "Helsinki",
	country: "FI"
}, {
	telephone: "041234567",
	mobile: "041234567",
});


var p = paytrail.createPayment({orderNumber:"0000001"});

p.then(function (response) {
	console.log(response);
}, function(err){
	console.error(err);
});
