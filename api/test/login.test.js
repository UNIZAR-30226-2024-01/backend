const { login } = require('../controller.js');

const constants = require('../constants'); // Importamos las constantes necesarias

describe('login', () => {
  test('debería devolver un mensaje de usuario incorrecto cuando el usuario no existe', async () => {
    // Simulamos que el usuario no existe en la base de datos
    const mockClient = {
      query: jest.fn().mockResolvedValueOnce({ rows: [] }),
      release: jest.fn(),
    };
    
    // Dentro de cada test, antes de llamar a login
    const mockPool = require('../connectionManager');
    mockPool.connect = jest.fn().mockResolvedValueOnce(mockClient);


    // Intentamos iniciar sesión con un usuario que no existe
    const result = await login('usuarioInexistente', 'contraseña');

    // Verificamos que el resultado sea un mensaje de usuario incorrecto
    expect(result.exito).toBe(false);
    expect(result.msg).toBe(constants.WRONG_USER);
  });

  test('debería devolver un mensaje de contraseña incorrecta cuando la contraseña es incorrecta', async () => {
    // Simulamos que la contraseña almacenada en la base de datos es diferente a la que proporcionamos
    const mockClient = {
      query: jest.fn().mockResolvedValueOnce({ rows: [{ passwd: 'contraseñaAlmacenada' }] }),
      release: jest.fn(),
    };
    
    const mockPool = require('../connectionManager');
    mockPool.connect.mockResolvedValue(mockClient);
  
    // Llamamos a la función login con la contraseña incorrecta
    const result = await login('usuarioExistente', 'contraseñaIncorrecta');
  
    // Verificamos que el resultado sea un mensaje de contraseña incorrecta
    expect(result.exito).toBe(false);
    expect(result.msg).toBe(constants.WRONG_PASSWD);
  });
  

  test('debería devolver un mensaje de inicio de sesión correcto cuando la contraseña es correcta', async () => {
    // Simulamos que el usuario existe en la base de datos y la contraseña es correcta
    const mockClient = {
      query: jest.fn().mockResolvedValueOnce({ rows: [{ passwd: 'contraseñaCorrecta' }] }),
      release: jest.fn(),
    };
    
    const mockPool = require('../connectionManager');
    mockPool.connect.mockResolvedValue(mockClient);

    // Intentamos iniciar sesión con una contraseña correcta
    const result = await login('usuarioExistente', 'contraseñaCorrecta');

    // Verificamos que el resultado sea un mensaje de inicio de sesión correcto
    expect(result.exito).toBe(true);
    expect(result.msg).toBe(constants.CORRECT_LOGIN);
  });
});
