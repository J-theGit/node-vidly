const auth = require('../../../middleware/auth');
const { User } = require('../../../models/users');

describe('auth middleware', () => {
    let token;
    let mockReq;
    let mockNext;
    
    function exec() {
        mockReq = { header: () => token };
        mockNext = jest.fn();
        auth(mockReq, {}, mockNext);
    }

    beforeEach(() => {
        token = new User({ admin:true }).generateToken();
    });
    
    it('should return user if valid token provided', () => {
        exec();
        expect(mockReq.user.admin).toBe(true);
    });

    it('should delegate to next middleware if valid token provided', () => {
        exec();
        expect(mockNext.mock.calls.length).toBe(1);
    });
});