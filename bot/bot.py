import sys
import random
import json
import time

info_tablero = []
info_habitaciones = []

# Comprobación de que ua casilla es válida
def checkIndex(index):
    if index < 0 or index >= len(info_tablero):
        return False
    if info_tablero[index]['isWalkable'] == False or info_tablero[index]['roomName'] != '':
        return False
    return True

# Comprobación de qué casillas vecinas son válidas
def checkNeighbours(index, vecinos):
    checked = []
    for i in range(4):
        if checkIndex(index + vecinos[i]) == True:
            checked.append(index + vecinos[i])
    return checked

def dls(casilla, dados, vecinos, visited):
    visited.append(casilla)

    if dados == 0:
        return

    for neighbour in checkNeighbours(casilla, vecinos):
        print(neighbour, dados, visited)
        if neighbour not in visited:
            dls(neighbour, dados - 1, vecinos, visited)

def turn():

    casilla = int(sys.argv[2])
    dados = int(sys.argv[3])
    lvl = int(sys.argv[4])

    if dados < 2 or dados > 12:
        print("Número de dados no válido: ", dados)
        sys.exit(1)

    if lvl < 1 or lvl > 3:
        print("Nivel de dificultad no válido: ", lvl)
        sys.exit(1)
    

    # Leer el JSON desde el archivo
    with open('../bot/infoHabitaciones.json', 'r') as file:
        global info_habitaciones
        info_habitaciones = json.load(file)

    with open('../bot/infoTablero.json', 'r') as file:
        global info_tablero
        info_tablero = json.load(file)

    if casilla < 0 or casilla >= len(info_tablero):
        print("Casilla inicial no válida: ", casilla)
        sys.exit(1)

    # Sintaxis del tablero: { isRoom: bool,  roomName: 'int', isStartingCell: bool, isWalkable: bool, isDoor: 'num_hab', idx:int }
    # Sintaxis de las habitaciones: { roomName: 'int', roomNumber: int, style: {} }
        
    n_cols = 24
    vecinos = [n_cols, 1, -n_cols, -1]

    # Comprobación de la casilla inicial
    if not checkIndex(casilla):
        print("Casilla inicial no válida: ", casilla)
        sys.exit(1)

    candidatos = []
    dls(casilla, dados, vecinos, candidatos)
    candidatos=sorted(candidatos)
    print(candidatos)


if __name__ == "__main__":

    time_ini = time.time()
    
    # Comprobación de parámetros
    if len(sys.argv) != 5:
        print("Uso: python bot.py <\"turn\"/\"susp\"> <casilla_inicial> <dados> <nivel>")
        sys.exit(1)

    type = sys.argv[1]
    if type != "turn" and type != "susp":
        print("Tipo de turno no válido: ", type)
        sys.exit(1)
    elif type == "turn":
        turn()
    else:
        print("Sospecha")

    time_fin = time.time()
    print("Tiempo de ejecución: ", time_fin - time_ini)
