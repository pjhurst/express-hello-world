var debug = require('debug')('apple-pay');
var request = require('request');
var fs = require('fs');
var path = require('path');
var certFilePath = path.resolve(__dirname, './resources/applepaytls.pem');
var keyFilePath = path.resolve(__dirname, './resources/applepaytls.key');

exports.validate = validate;
const appleKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6bh8Ii2KO2HaR
gQ8ZkFYWmNk0FRw/p6gwwTt8x+T5I6o2vG1QP20NeEWsG3o1rR2xTLrem+/Kr7W/
Wl4E5JOliKdj7rohPSeTZRlDPXpddcyHjYrByp/rtBP18Nw5IPvJJs854+vhbnB3
RHlcwg3AWnZ3JIACuQxd+eFlhJ9JQz3oeoegyOQfonknK2BNqlGldrk+AGXKKGAu
nivUtEgMejl6fSyhyOUMiH3tRRd7zajqLAvSwga6EPI4DaxhwaLdw9l3yPEoy41u
WW/BXHpM8n6PPINGtGZNBlyFL+bN3AdX5qm+wOvCjM0gbJkv75Xln5LHFT2uTVbm
yhO8wmPtAgMBAAECggEAQ9BQy4vgIvPMVWsrsfHVzsx0ncRcDS+QN4PifqY7vQBj
Jxvta3ZW1cJ9HXi1QJcjKN4vT1BLrl+x7dQSRRdcOad2tBwfan3TSoNI6DORsjNq
XZh387wf5d4QMLMXeFRuIiJS2Mz2fX7tvASVXM9dry140CffxJ3JSNnfSk0un7gN
+puJloXkMp1OIJhsghg80ruQMlcMYrUQUSyy+DzeUH5MIWfnvM2b1zhcKs4eVa8O
cN/QUS7mR/Jlm+gCg+y/ksCcmmcMoMBIed35UfC0i5tmNzUT01RWUZlP/82u3ndr
2pbe4kq8kJw8xSCUlQ7WgZcPFGqjQQwXo9HsbHfeRQKBgQDbOWVxvWFVgCNK/Ocz
4gDN+1eYpCe186Qxp+OMu/HTiLQPiAdRU6d3+zO/CFUsx33K5gn4g/nnWZz3h9RH
8ATMmUpodEZpUYegQB5RdTwLzpteMpq34aRquHiP0TrBqo373cfihYhslPRy9WDJ
bo+UtDo+WDjO1+k+HT6sX9B5mwKBgQDZtGG5vSMqUW6HAepB2XUZfcQ/FtTjaGhW
BUuSKwGiwHDyDip1a2PLibWzh+0aDazfs+8IRLTc8uO1op9R0vaKm6CyxwMCF6qT
SQeoDe2GYj+cTS0Ff17aAERfZzYjpMSAA2rjmqrzkjrK42/KwUjbUBz52NKqDdeK
kJdU8+VVFwKBgB3yvFoKbhaZF7kxzX/3+vYoxPG0Uzx3GVIzRlG+hy3Huhl5Es7Y
Z8NrTMlnIQOqCRRD0s7hcK1bP6dNJgHh1zYAJvsYD1pp6eZJfBrSsi5GvlDjBuHh
8G0n4Eh9Y9J7M0RaKulWJqn2u2JNBTjfYrwE1wQXV0NimZmDs0EnIbrLAoGALpsN
KMQy2QZh0Qk56yrwhKqF7rOmk6BwZanwibQnP35PL6KUuFprHNG4UlzRB3jR/3n3
vB9pULu2v9W2ob+2A+pZNqygGjySycEioHmK1fAGiiGDd9/SoHzaJkpkLrFBV95j
baJY4pf1eiXCcvd572lxKpOeVcVs1T8rBobIG7UCgYEAqRxhZtmULrgiVDj8aNxF
DRYmEVDVB4Qr8JFT21MVRtvtueHJRIzmjPvfKxqxHNw/AJp8Vu7a4FlEXQOMMjuh
F+KK9EhwsWW3Wqjtsvzssmq03zOFRtjprRBxxjCGOUK+pnXwE6H2FOdDi8+K1RaH
3UR6PUJucESTDw8a7nMo8W8=
-----END PRIVATE KEY-----`;

const applePem = `-----BEGIN CERTIFICATE-----
MIIGQjCCBSqgAwIBAgIQVzOlsKdHyYu4lFXswuTBKTANBgkqhkiG9w0BAQsFADB1
MUQwQgYDVQQDDDtBcHBsZSBXb3JsZHdpZGUgRGV2ZWxvcGVyIFJlbGF0aW9ucyBD
ZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTELMAkGA1UECwwCRzMxEzARBgNVBAoMCkFw
cGxlIEluYy4xCzAJBgNVBAYTAlVTMB4XDTIzMDIwMjIyMDcwNloXDTI1MDMwMzIy
MDcwNVowgcQxOjA4BgoJkiaJk/IsZAEBDCptZXJjaGFudC5jb20ub25yZW5kZXIu
YXBwbGVwYXktaW50ZWdyYXRpb24xTzBNBgNVBAMMRkFwcGxlIFBheSBNZXJjaGFu
dCBJZGVudGl0eTptZXJjaGFudC5jb20ub25yZW5kZXIuYXBwbGVwYXktaW50ZWdy
YXRpb24xEzARBgNVBAsMClNaRzY5UDIyTlkxIDAeBgNVBAoMF0NTRyBGT1JURSBQ
QVlNRU5UUywgSU5DMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAum4f
CItijth2kYEPGZBWFpjZNBUcP6eoMME7fMfk+SOqNrxtUD9tDXhFrBt6Na0dsUy6
3pvvyq+1v1peBOSTpYinY+66IT0nk2UZQz16XXXMh42Kwcqf67QT9fDcOSD7ySbP
OePr4W5wd0R5XMINwFp2dySAArkMXfnhZYSfSUM96HqHoMjkH6J5JytgTapRpXa5
PgBlyihgLp4r1LRIDHo5en0socjlDIh97UUXe82o6iwL0sIGuhDyOA2sYcGi3cPZ
d8jxKMuNbllvwVx6TPJ+jzyDRrRmTQZchS/mzdwHV+apvsDrwozNIGyZL++V5Z+S
xxU9rk1W5soTvMJj7QIDAQABo4ICfDCCAngwDAYDVR0TAQH/BAIwADAfBgNVHSME
GDAWgBQJ/sAVkPmvZAqSErkmKGMMl+ynsjBwBggrBgEFBQcBAQRkMGIwLQYIKwYB
BQUHMAKGIWh0dHA6Ly9jZXJ0cy5hcHBsZS5jb20vd3dkcmczLmRlcjAxBggrBgEF
BQcwAYYlaHR0cDovL29jc3AuYXBwbGUuY29tL29jc3AwMy13d2RyZzMwOTCCAS0G
A1UdIASCASQwggEgMIIBHAYJKoZIhvdjZAUBMIIBDTCB0QYIKwYBBQUHAgIwgcQM
gcFSZWxpYW5jZSBvbiB0aGlzIENlcnRpZmljYXRlIGJ5IGFueSBwYXJ0eSBvdGhl
ciB0aGFuIEFwcGxlIGlzIHByb2hpYml0ZWQuIFJlZmVyIHRvIHRoZSBhcHBsaWNh
YmxlIHN0YW5kYXJkIHRlcm1zIGFuZCBjb25kaXRpb25zIG9mIHVzZSwgY2VydGlm
aWNhdGUgcG9saWN5IGFuZCBjZXJ0aWZpY2F0aW9uIHByYWN0aWNlIHN0YXRlbWVu
dHMuMDcGCCsGAQUFBwIBFitodHRwczovL3d3dy5hcHBsZS5jb20vY2VydGlmaWNh
dGVhdXRob3JpdHkvMBMGA1UdJQQMMAoGCCsGAQUFBwMCMB0GA1UdDgQWBBTCY/Gf
IaaZpSo+7JcZ2ouQjfJxzzAOBgNVHQ8BAf8EBAMCB4AwTwYJKoZIhvdjZAYgBEIM
QEZGMjAwRjU5RTMxMkJFRTEyNkQzNDAwQjg2RDE3MDE2QjMwMUUxNUU4QjJFMTEx
ODM5QkJENkYyRDdBRDM3MDgwDwYJKoZIhvdjZAYuBAIFADANBgkqhkiG9w0BAQsF
AAOCAQEAn8OzO33iqQNsEHm8YE99zeTegPr5Yt0qiJSN1A2d0kDe6YkEHN1McbMm
7by0RPx4cKRTSABMG8VU04q1MR1bl5gA+B2aiae3/iPj2DfGhZiK3DBIb0HQlo3d
iYPQ4ObBm0OfWu2ohjBCQFIFdu4ddH7IpPPTAItEEmFIMRK/EFe9G+kZQxjEwPPH
wnBsg/9akghxJf1NSJrtB4rjiR9MI43h44OpupkoMKAThEX/gj8QitiZx31eHNZX
qAbALTuTpAw9DxMH7YxzIxa99E2b2aZhZ2xmJ1z3v9OB2uTqslT3vNW/ppGG4qnD
dIB1Tq4lHTKXtBwuou/w7D1QSGBmuQ==
-----END CERTIFICATE-----`;
function validate (req, res) {
	if (!req.body.validationURL) {
		return res.status(400).send('Missing validation URL.');
	}
	request.post({
		url: req.body.validationURL,
		json: true,
		body: {
			merchantIdentifier: "merchant.com.onrender.applepay-integration",
			displayName:"poctest",
			domainName: "applepay-integration.onrender.com"
		},
		cert: applePem,
		key: appleKey
	}, function (err, resp, body) {
		if (err) {
			debug(err);
			res.sendStatus(500);
			return;
		}
		if (body.statusCode === '400' || body.statusCode === '500') {
			debug(body);
			res.status(400).json(body);
			return;
		}
		debug('Session validation received.');
		res.json(body);
	});
}
