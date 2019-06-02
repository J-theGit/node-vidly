const error = require('../../../middleware/error');

describe('error middleware', () => {
    it('should send 500 when triggered', () => {
        const req = jest.fn();
        const send = jest.fn();
        const res = { 
            status: jest.fn().mockReturnValue({
                send
            }), 
        };
        const next = jest.fn();
        error('error', req, res, next);

        expect(res.status.mock.calls[0][0]).toBe(500);
        expect(send.mock.calls.length).toBe(1);
        expect(next.mock.calls.length).toBe(0);
    });
});