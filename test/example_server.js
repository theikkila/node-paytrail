var express = require('express');
var app = express();
var paytrail = require('../index');

var options = {
	merchantId: "13466",
	merchantSecret: "6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ",
}

// Notification url should be public!
var urls =  {
	success: "http://localhost:3000/payment/success",
	failure: "http://localhost:3000/payment/failure",
	notification: "http://localhost:3000/payment/notify"
};





app.get('/', function (req, res) {
	res.send('Example payment site\n <a href="/makepayment">Make Payment</a>');
})

app.get('/makepayment', function (req, res) {
	// Creating new payment
	var payment = paytrail(options, urls);

	// Add products
	payment.addProduct({title:"Product 1", amount:2, price: 14.56, vat: 24});
	payment.addProduct({title:"Product 2", amount:1, price: 20.00, vat: 24});
	payment.addProduct({title:"Product 3", amount:6, price: 3.10, vat: 24});

	// Set contact
	payment.setContact({
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

	// Process payment
	var p = payment.createPayment({orderNumber:"0000001"});

	p.then(function (response) {
		// If transaction is accepted api resolves token and url
		console.log(response);
		// ====================================================
		// YOU SHOULD SAVE THE PAYMENT HERE IN YOUR OWN BACKEND
		// ====================================================

		// Redirecting user to payment page
		res.redirect(response.url);
	}, function(err){
		console.error(err);
		res.send(err);
	});
});

app.get('/payment/success', function (req, res) {
	var payment = paytrail(options, urls);
	if(payment.confirmSuccess(req.query['ORDER_NUMBER'], req.query['TIMESTAMP'], req.query['PAID'], req.query['METHOD'], req.query['RETURN_AUTHCODE'])) {
		console.log("Payment accepted!");
		res.send("OK");
	} else {
		res.send("No way! no hacking allowed! Payment failed.");
	}
});

app.get('/payment/failure', function (req, res) {
	var payment = paytrail(options, urls);
	if (payment.confirmFailure(req.query['ORDER_NUMBER'], req.query['TIMESTAMP'], req.query['RETURN_AUTHCODE'])) {
		res.send("OK payment failed :(");
	} else {
		res.send("No way! no hacking allowed! Payment failing failed! :D");
	}
});


var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})