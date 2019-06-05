const admin = require('../../../middleware/admin');

describe('admin middleware', () => {
    it('should return 403 admin is not true', () => {
        const req = { user: { admin: false } };
        const send = jest.fn();
        const res = { 
            status: jest.fn().mockReturnValue({
                send
            }), 
        };
        const next = jest.fn();
        admin(req, res, next);

        expect(res.status.mock.calls[0][0]).toBe(403);
        expect(send.mock.calls.length).toBe(1);
        expect(next.mock.calls.length).toBe(0);
    });

    it('should return 403 admin is not true', () => {
        const req = { user: { admin: true } };
        const res = jest.fn();
        const next = jest.fn();
        admin(req, res, next);

        expect(next.mock.calls.length).toBe(1);
    });
});