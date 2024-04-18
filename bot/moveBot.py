###############################################
# Author: Grace Hopper
#
#
#
###############################################

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
    if info_tablero[index]['isWalkable'] == False or (info_tablero[index]['roomName'] != '' and info_tablero[index]['isDoor'] == False):
        return False
    return True

# Comprobación de qué casillas vecinas son válidas
def checkNeighbours(index, vecinos):
    checked = []
    if info_tablero[index]['isDoor'] != False:
        if(info_tablero[index]['isDoor'] == 'd'):
            checked.append(index + vecinos[0])
        elif(info_tablero[index]['isDoor'] == 'r'):
            checked.append(index + vecinos[1])
        elif(info_tablero[index]['isDoor'] == 'u'):
            checked.append(index + vecinos[2])
        elif(info_tablero[index]['isDoor'] == 'l'):
            checked.append(index + vecinos[3])
    else:
        for i in range(4):
            if checkIndex(index + vecinos[i]):
                checked.append(index + vecinos[i])
    return checked


def bfs(casilla, dados, vecinos):
    visited = []
    if info_tablero[casilla]['roomName'] != '':
        # estamos en una habitacion y podemos salir por varias puertas y hay pasadizos
        frontera = [c['idx'] for c in info_tablero if info_tablero[casilla]['roomName'] == c['roomName'] and c['isDoor']!=False]
        paths = [c for c in info_tablero if info_tablero[casilla]['roomName'] == c['roomName'] and c['isPath']!=False]
        for c in paths:
            print(c)
            visited.append(int(c['isPath']))
        
        print(f"la frontera es {frontera} y los visited son {visited}")
        
    else:
        frontera = [casilla]
    while dados >= 0:
        for _ in range(len(frontera)):
            casilla = frontera.pop(0)
            visited.append(casilla)
            for neighbour in checkNeighbours(casilla, vecinos):
                if neighbour not in visited and neighbour not in frontera:
                    frontera.append(neighbour)
        dados -= 1

    return visited

def turn(casillas_pjs, casilla, dados):

    if dados < 2 or dados > 12:
        print("Número de dados no válido: ", dados)
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

    candidatos = bfs(casilla, dados, vecinos)
    candidatos = sorted(candidatos)
    print(candidatos)

def sospecha():
    pass
    

if __name__ == "__main__":

    time_ini = time.time()
    
    # Comprobación de parámetros
    if len(sys.argv) != 5:
        print("Uso: python bot.py <[casillas_pjs]> <casilla_inicial> <dados> <tarjeta>")
        sys.exit(1)

    # Inicialización de variables
    casillas_pjs = sys.argv[1]    
    yo = int(sys.argv[2])
    casilla = casillas_pjs[yo]

    # Eliminar la componente "yo" de la lista de casillas de los jugadores
    casillas_pjs = casillas_pjs[:yo] + casillas_pjs[yo+1:]

    dados = int(sys.argv[3])
    turn(casillas_pjs, casilla, dados)

    sospecha()

    time_fin = time.time()
    print("Tiempo de ejecución: ", time_fin - time_ini)
