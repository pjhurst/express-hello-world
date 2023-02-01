var session = null;
window.addEventListener("message", (event) => {
	var request = null;
	if (event.data.type === "applepayabort") {
		session.abort();
	}
	if (event.data.type === "applepaycomplete") {
		console.log("applecomplete " + window.ApplePaySession.STATUS_SUCCESS);
		session.completeMerchantValidation(window.ApplePaySession.STATUS_SUCCESS);
	}
	if (event.data.type === "applepaycompletepm") {
		console.log(
			"applecomplete pm total " +
				event.data.total +
				" lineitems " +
				event.data.lineItems
		);
		session.completePaymentMethodSelection(
			event.data.total,
			event.data.lineItems
		);
	}
	if (event.data.type === "applepaycompletemv") {
		console.log("applecomplete mv " + typeof event.data.data);
		console.dir(event.data.data);
		//event.data.data["domainName"] = "localhost";
		session.completeMerchantValidation(event.data.data);
	}
	if (event.data.type === "applepay") {
		console.log("request");
		console.dir(event.data.data);
		request = event.data.data;
		session = new ApplePaySession(1, request);
		console.log("session");
		console.dir(session);
		session.onvalidatemerchant = (eve) => {
			console.log(eve.validationURL);
			event.source.postMessage(
				{
					type: "validatemerchant",
					validationUrl: eve.validationURL,
				},
				"*"
			);
			//this.validateApplePayMerchant(session, event);
		};
		session.onpaymentmethodselected = (eve) => {
			console.log("onpaymentmethodselected");
			event.source.postMessage(
				{
					type: "paymentmethodselected",
					request: request,
					paymentMethod: eve.paymentMethod,
				},
				"*"
			);
		};

		session.onpaymentauthorized = (eve) => {
			console.log("onpaymentauthorized");
			event.source.postMessage(
				{
					type: "paymentauthorized",
					request: request,
					payment: eve.payment,
				},
				"*"
			);
		};

		session.oncancel = (eve) => {
			console.log("oncancel called");
			console.dir(eve);
		};
		session.begin();

		//   const session = new ApplePaySession(1, event.data.data);

		//   session.onpaymentauthorized = (event) => {
		//     event.source.postMessage({ type: 'paymentauthorized', payment: event.payment});
		//   }
	}
});
