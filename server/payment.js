var debug = require("debug")("apple-pay");
var request = require("request");

exports.authorize = authorize;

function authorize(req, res) {
	var token = req.body.payment.token;
	var shippingContact = req.body.payment.shippingContact;
	var billingContact = req.body.payment.billingContact;
	var consolelogdata = {
		order_no: "0000001", // test order no
		payment: {
			payment_id: "089e4cd378bff63d9d7bd63f8f", // test UUID
			type: "ApplePay",
			amount: req.body.amount * 100,
			currency: "USD",
			token: Buffer.from(JSON.stringify(token.paymentData)).toString("base64"),
		},
		customer_info: {
			customer_no: "",
			email: shippingContact.emailAddress,
			customer_name:
				shippingContact.givenName + " " + shippingContact.familyName,
		},
		shipping_address: {
			first_name: shippingContact.givenName,
			last_name: shippingContact.familyName,
			address1: shippingContact.addressLines[0],
			city: shippingContact.locality,
			state_code: shippingContact.administrativeArea,
			postal_code: shippingContact.postalCode,
			country_code: shippingContact.countryCode,
		},
		billing_address: {
			first_name: billingContact.givenName || shippingContact.givenName,
			last_name: billingContact.familyName || shippingContact.familyName,
			address1: billingContact.addressLines[0],
			city: billingContact.locality,
			state_code: billingContact.administrativeArea,
			postal_code: billingContact.postalCode,
			country_code: billingContact.countryCode,
		},
	};
	console.log(consolelogdata);
	request.post(
		{
			url: "http://127.0.0.1:5000/decrypt",
			json: true,
			body: req.body.payment.token,
		},
		function (err, resp, body) {
			if (err) {
				debug(err);
				res.sendStatus(500);
				return;
			}
			debug(body);
			res.json(body);
		}
	);
}
