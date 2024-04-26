const { createAccount } = require('../controller.js');
const constants = require('../constants.js');
const pool = require('../connectionManager');

describe('createAccount', () => {

    afterAll(() => {
        // Close all database connections
        pool.end();
    });

    test('should create account correctly', async () => {
        const mockClient = {
            query: jest.fn()
                .mockResolvedValueOnce({ rows: [] }) 
                .mockResolvedValueOnce({}) 
                .mockResolvedValueOnce({ rows: [{ username: 'testUser' }] }),
            release: jest.fn(),
        };

        const mockPool = require('../connectionManager');
        mockPool.connect = jest.fn().mockResolvedValueOnce(mockClient);

        const username = 'testUser';
        const password = 'testPassword';

        const result = await createAccount(username, password);

        expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_USER_USUARIO, [username]);
        expect(mockClient.query).toHaveBeenCalledWith(constants.INSERT_JUGADOR, [username, null, null, null, null, 0]);
        expect(mockClient.query).toHaveBeenCalledWith(constants.INSERT_USUARIO, [username, password, 0, 0, 0, 0]);
        expect(result).toEqual({ exito: true, username });
        expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

  test('should return an error if username already exists', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValueOnce({ rows: [{ username: 'existingUser' }] }), // Simulate that the user already exists
      release: jest.fn(),
    };
    const mockPool = require('../connectionManager');
    mockPool.connect = jest.fn().mockResolvedValueOnce(mockClient);

    const username = 'existingUser';
    const password = 'testPassword';

    const result = await createAccount(username, password);

    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_USER_USUARIO, [username]);
    expect(result).toEqual({ exito: false, username });
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });
});
