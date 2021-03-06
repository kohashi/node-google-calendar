let sinon = require('sinon');
let chai = require('chai');
let expect = chai.expect;

describe('FreeBusy.js', function () {
	let freebusy = require('../src/FreeBusy');

	it('Should return error if missing arguments when calling constructor', () => {
		try {
			let freebusyInstance = new freebusy();
		} catch (err) {
			const expectError = new Error('FreeBusy constructor: Missing arguments');
			expect(err.message).to.eql(expectError.message);
		}
	});

	it('Should return calendars[CalendarId].busy in http response body when FreeBusy.query', () => {
		let mockCalendarId = '...@gmail.com';
		let mockBusyEvents = [{
			start: '2017-07-06T10:00:00+08:00',
			end: '2017-07-06T11:30:00+08:00'
		},
		{
			start: '2017-07-07T09:00:00+08:00',
			end: '2017-07-07T12:00:00+08:00'
		}];
		let mockResponse = {
			statusCode: 200,
			body: {
				kind: 'calendar#freeBusy',
				timeMin: '2017-07-05T01:00:00.000Z',
				timeMax: '2017-07-10T13:00:00.000Z',
				calendars: {
					'...@gmail.com': { busy: mockBusyEvents }
				}
			}
		};

		let mockHttpRequest = {
			post: sinon.stub().resolves(mockResponse)
		};
		let expectedResult = mockResponse.body.calendars[mockCalendarId].busy;

		let freebusyInstance = new freebusy(mockHttpRequest, 'jwt', 'gcalurl', 'timezone');
		return freebusyInstance.query(mockCalendarId, {})
			.then((results) => {
				expect(results).to.eql(expectedResult);
			});
	});

	it('Should return rejected promise with error when http response returns non-200 error code during FreeBusy.query', () => {
		let mockCalendarId = '...@gmail.com';
		let mockResponse = {
			statusCode: 400,
			statusMessage: 'Missing parameter',
			body: {
				"error": {
					"errors": [
						{
							"domain": "global",
							"reason": "required",
							"message": "Missing timeMin parameter."
						}
					],
					"code": 400,
					"message": "Missing timeMin parameter."
				}
			}
		};

		let mockHttpRequest = {
			post: sinon.stub().resolves(mockResponse)
		};
		let expectedResult = {
			origin: 'FreeBusy.query',
			error: {
				statusCode: `${mockResponse.statusCode}(${mockResponse.statusMessage})`,
				errorBody: mockResponse.body
			}
		};

		let freebusyInstance = new freebusy(mockHttpRequest, 'jwt', 'gcalurl', 'timezone');
		return freebusyInstance.query(mockCalendarId, {})
			.catch((err) => {
				expect(JSON.parse(err.message)).to.eql(expectedResult);
			});
	});

});
