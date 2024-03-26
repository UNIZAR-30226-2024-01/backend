import sys

# Comprobación de parámetros
if len(sys.argv) != 4:
    print("Uso: python bot.py <casilla_inicial> <dados> <nivel>")
    sys.exit(1)

casilla = sys.argv[1]
dados = sys.argv[2]
lvl = sys.argv[3]
n_cols = 8
neighbours = [n_cols, 1, -n_cols, -1]

import json

# Leer el JSON desde el archivo
with open('infoHabitaciones.json', 'r') as file:
    info_habitaciones = json.load(file)

with open('infoTablero.json', 'r') as file:
    info_tablero = json.load(file)

# Comprobación de la casilla inicial
# Sintaxis del tablero: { isRoom: bool,  roomName: 'int', isStartingCell: bool, isWalkable: bool, isDoor: 'num_hab', idx:int }
    print(info_tablero[casilla])
if not casilla in info_tablero:
    print("Casilla inicial no válida")
    sys.exit(1)

# Comprobar si los neighbours son válidos
# Sintaxis del tablero: { isRoom: bool,  roomName: 'int', isStartingCell: bool, isWalkable: bool, isDoor: 'num_hab', idx:int }
for i in range(4):
    if info_tablero[casilla+i].isWalkable == False:
        print("Casilla vecina no válida")
        sys.exit(1)
    


