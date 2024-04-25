const { createAccount } = require('../controller.js');

// Mock para pool.connect()
jest.mock('../connectionManager', () => ({
  connect: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn(),
  })),
}));

// Mock para los queries y valores constantes
jest.mock('../constants.js', () => ({
  SELECT_USER_USUARIO: 'SELECT_USER_USUARIO',
  INSERT_JUGADOR: 'INSERT_JUGADOR',
  INSERT_USUARIO: 'INSERT_USUARIO',
}));

describe('createAccount', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });


  /*test('debería crear una cuenta con un nuevo nombre de usuario', async () => {
    const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [] }) // Simula que no hay ningún usuario con el mismo nombre
          .mockResolvedValueOnce({ rows: [{ userName: 'nuevoUsuario' }] }), // Simula la inserción exitosa del nuevo usuario
        release: jest.fn(),
    };
  
    const mockPool = require('../connectionManager');
    mockPool.connect.mockResolvedValue(mockClient);
  
    const result = await createAccount('nuevoUsuario', 'contraseña');
  
    expect(result.exito).toBe(true);
    expect(result.username).toBe('nuevoUsuario');
    expect(mockClient.query).toHaveBeenCalledTimes(2);
    expect(mockClient.release).toHaveBeenCalledTimes(1);
 });*/

 

  /*test('debería devolver !exito y el nombre de usuario si el usuario ya existe', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValueOnce({ rows: [{ userName: 'usuarioExistente' }] }),
      release: jest.fn(),
    };
    const mockPool = require('../connectionManager');
    mockPool.connect.mockResolvedValue(mockClient);

    const result = await createAccount('usuarioExistente', 'contraseña');

    expect(result.exito).toBe(false);
    expect(result.userName).toBe('usuarioExistente');
    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });*/

  test('debería lanzar una excepción si ocurre un error al ejecutar la consulta', async () => {
    const mockError = new Error('Error en la consulta');
    const mockClient = {
      query: jest.fn().mockRejectedValueOnce(mockError),
      release: jest.fn(),
    };
    const mockPool = require('../connectionManager');
    mockPool.connect.mockResolvedValue(mockClient);

    await expect(createAccount('nuevoUsuario', 'contraseña')).rejects.toThrow(mockError);
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });
});

