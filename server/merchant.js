var debug = require('debug')('apple-pay');
var request = require('request');
var fs = require('fs');
var path = require('path');
var certFilePath = path.resolve(__dirname, './resources/applepaytls.pem');
var keyFilePath = path.resolve(__dirname, './resources/applepaytls.key');

exports.validate = validate;
const appleKey = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDPISmVbjYMGuKJ
RhreJkeKHuhnETSXEYMp+Iv3aV49uPCjOmKAux1U/19ecnCTuf0APF0kwbvyefvs
SF/3PReX658Toqnaj5Bvv/66lDiRVNsq20CWbJGSI5hseD0B1n5GqYl7OeM2SCPU
m/v1oaMMKGXCl8ZfB092RIF81Ro8mKZeKCpHqHT39J/jDpfxBz06T8eaDHqYz47O
/PPKHhKX8Kmw6Hk0w+FaJ1GAnXTb+f1wGzpAvjusBBZmomePatb8lW3mgatcKd7A
NokkOPBo4ZtavWME2xxR/TLbfEd9CRYtPG/UkR5PyTy720MgByByuXY/Rk5d8FB7
Ea1DHagBAgMBAAECggEBAKYPEkWpLE+cJk6kE9pSmjxT90Laem07LwsxJxXeNh4J
7XMP1fUbDrMcYhtYaIUnMX1E5/AWGlaWEbEnfTi8k/PKhai6Wq7NNqFBLjnrp0Zs
36GGUkvHExY0z3j3FQIqMub3+S8AA/d68q77t48AXbXblWnjQLjjJYPN/HpWZ0h4
MFgWxFny0FIYSqPU2Ds2D7cy1dqKRL4Dsa+QUEM35y8ilIWWTCAa/yjVG0jPIeIH
OEdEmivTIkBb/7vPoJp4qQsXwuuGxurSuzIDPIxB432pSs18Ifd2q1iVv2maDtq6
VdPqscKJyZvd9U1C4AI4llwxRYDHrqh/T9TP18hJ21kCgYEA7O2wBgipBpX9mLSy
S1LJUJt67SpM698VyuhmqFPTW0RQqNbMXb93DzXUTOLrLRPKgfJsKlX3Al6IygDW
eh5V+e4szsJV2LFXBfKmOqCZ5PfWDb9Thy8TZOYVXnRYCIJF4ZBZUJGQczARZPzb
Olzp7jKkPDnRaoAxiJipBZzmdfMCgYEA381q4IcIqHI8RP2K7URgOv/u/ixGsuzc
9FM/vAYo/PdVz0pLkxStUzgxNCkFv8foQfndUoxqQBjcEkqmuvvZFTSudgXJ/q9+
NJBqEPNIR7bLBbIQq1GZ+zBhXTrTZxgbf52dkRyIf1zWmci5cDISnt6SFeNdQKI+
tMPSd+tu4zsCgYEAku2r1XIVcBIgHE0irHeAhM6G4wDyhuvnldedohGp5tVst+fN
AO41pWcaazvl4CR/1ypBTdfVwNBjP/JZD440fzPm8amulx0S/ItH7t+d0FKpmgjm
gdT9z/qnkdXQqiYvs/xShxZeYDCU+O2d/omUQLWDCB5K8iLhlPYnC2YLvWUCgYAF
ZGKd1EMOI+p10xIE02/qG/57Gz/80Z4lONhBRHi6V482tliJy6a9aY4t7osX6s4a
wNVnRsDMmIy82BWaTbUWQLWvXEZYn4vP4mbbz7C/IZVUpsymBApMtgayg1dSlY8c
DQUd2O0k/GyjOeXV4S73qu8kHd1CUGZoXot0njSGvwKBgQDjy1EwKPZLSYeRHomU
MKz1AW7vU+yXwxT0noNT/7I6MjQ0YLjSO567QLhPP4DdNZp9aZ2eYADt2KIpCCYa
OPncg6EtWhfXnCp502I2F9Q5ozhIMO9z2LH+NQ6aqMsD74Q2px1zzct5KsBGvmIz
uPX83Fg4LA20ULvBRCktsp7WBA==
-----END PRIVATE KEY-----`;

const applePem = `-----BEGIN CERTIFICATE-----
MIIGOjCCBSKgAwIBAgIQO11s0coZYuC95BG8uSdFhzANBgkqhkiG9w0BAQsFADB1
MUQwQgYDVQQDDDtBcHBsZSBXb3JsZHdpZGUgRGV2ZWxvcGVyIFJlbGF0aW9ucyBD
ZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTELMAkGA1UECwwCRzMxEzARBgNVBAoMCkFw
cGxlIEluYy4xCzAJBgNVBAYTAlVTMB4XDTIyMDUyNTIyNTMxOVoXDTI0MDYyMzIy
NTMxOFowgbwxNjA0BgoJkiaJk/IsZAEBDCZtZXJjaGFudC5jb20uNHRhLmNoZWNr
b3V0LWxpdmUtdGVzdGxhbjFLMEkGA1UEAwxCQXBwbGUgUGF5IE1lcmNoYW50IElk
ZW50aXR5Om1lcmNoYW50LmNvbS40dGEuY2hlY2tvdXQtbGl2ZS10ZXN0bGFuMRMw
EQYDVQQLDApTWkc2OVAyMk5ZMSAwHgYDVQQKDBdDU0cgRk9SVEUgUEFZTUVOVFMs
IElOQzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAM8hKZVuNgwa4olG
Gt4mR4oe6GcRNJcRgyn4i/dpXj248KM6YoC7HVT/X15ycJO5/QA8XSTBu/J5++xI
X/c9F5frnxOiqdqPkG+//rqUOJFU2yrbQJZskZIjmGx4PQHWfkapiXs54zZII9Sb
+/WhowwoZcKXxl8HT3ZEgXzVGjyYpl4oKkeodPf0n+MOl/EHPTpPx5oMepjPjs78
88oeEpfwqbDoeTTD4VonUYCddNv5/XAbOkC+O6wEFmaiZ49q1vyVbeaBq1wp3sA2
iSQ48Gjhm1q9YwTbHFH9Mtt8R30JFi08b9SRHk/JPLvbQyAHIHK5dj9GTl3wUHsR
rUMdqAECAwEAAaOCAnwwggJ4MAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUCf7A
FZD5r2QKkhK5JihjDJfsp7IwcAYIKwYBBQUHAQEEZDBiMC0GCCsGAQUFBzAChiFo
dHRwOi8vY2VydHMuYXBwbGUuY29tL3d3ZHJnMy5kZXIwMQYIKwYBBQUHMAGGJWh0
dHA6Ly9vY3NwLmFwcGxlLmNvbS9vY3NwMDMtd3dkcmczMDkwggEtBgNVHSAEggEk
MIIBIDCCARwGCSqGSIb3Y2QFATCCAQ0wgdEGCCsGAQUFBwICMIHEDIHBUmVsaWFu
Y2Ugb24gdGhpcyBDZXJ0aWZpY2F0ZSBieSBhbnkgcGFydHkgb3RoZXIgdGhhbiBB
cHBsZSBpcyBwcm9oaWJpdGVkLiBSZWZlciB0byB0aGUgYXBwbGljYWJsZSBzdGFu
ZGFyZCB0ZXJtcyBhbmQgY29uZGl0aW9ucyBvZiB1c2UsIGNlcnRpZmljYXRlIHBv
bGljeSBhbmQgY2VydGlmaWNhdGlvbiBwcmFjdGljZSBzdGF0ZW1lbnRzLjA3Bggr
BgEFBQcCARYraHR0cHM6Ly93d3cuYXBwbGUuY29tL2NlcnRpZmljYXRlYXV0aG9y
aXR5LzATBgNVHSUEDDAKBggrBgEFBQcDAjAdBgNVHQ4EFgQUlcXeD/Zw4MU1lSFL
orwIGBpIEeIwDgYDVR0PAQH/BAQDAgeAME8GCSqGSIb3Y2QGIARCDEA2QkIzN0Y1
RUQzREFGNjQ3OTZDNDJFRjk5OUJFNDE3QjJFRUM3NjgzRjQ4QjVDMkM4MUU0NzJG
MzEwQjRERDczMA8GCSqGSIb3Y2QGLgQCBQAwDQYJKoZIhvcNAQELBQADggEBAM7C
iM/6mDeeWPIitg4o52qiBwjN7vvxXSGXikaB0REW2gEth2DkEkVrOtm188vyxn1F
tFv2hkOaoKcP6c6JxBRXhL4iyDpfyRAL8NuLKco0eYOcEj6W9t5bpQq8b1VVJlfX
VmTwKLOVRUUFINuRZYlYRKkinGanBTu5rgV0lwsM+0y4ZQs14aY3K3A+TXXlyeSw
+E+mYp7Ye4XE98HosMwyBycomxEecwOuL+M+NJM/b2iiZIQgpytHnE/XG8jK7SRC
vcsZRYE8i5t0qJhs9MzO/9a6RhI9KqcAGJTCjeujPFwnLS6/OVouefdP0xvImj6G
38iCWrHdAuFuRyZkf9Y=
-----END CERTIFICATE-----`;
function validate (req, res) {
	if (!req.body.validationURL) {
		return res.status(400).send('Missing validation URL.');
	}
	request.post({
		url: req.body.validationURL,
		json: true,
		body: {
			merchantIdentifier: "merchant.com.4ta.checkout-live-testlan",
			displayName:"4ta",
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
