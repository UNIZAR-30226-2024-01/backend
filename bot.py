import sys

# Comprobación de parámetros
if len(sys.argv) != 4:
    print("Uso: python bot.py <casilla_inicial> <dados> <nivel>")
    sys.exit(1)

casilla = sys.argv[1]
dados = sys.argv[2]
lvl = sys.argv[3]

import json

# Leer el JSON desde el archivo
with open('infoHabitaciones.json', 'r') as file:
    info_habitaciones = json.load(file)

with open('infoTablero.json', 'r') as file:
    info_tablero = json.load(file)

# Usar los datos en Python
for habitacion in info_habitaciones:
    print(habitacion['roomName'], habitacion['roomNumber'], habitacion['style'])
