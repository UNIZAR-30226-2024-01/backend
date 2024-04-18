###############################################
# Author: Grace Hopper
#
#
#
###############################################

import sys
import random
import time

def checkArgs():
    if len(sys.argv) != 11:
        print("Usage: python3 updateCard.py <yo> <lvl> <turn> <asker> <asked> <who> <where> <what> <hasSmg> <suspCard> <card>")
        sys.exit(1)

def update():
    initSusp = 1
    yo = sys.argv[initSusp]
    lvl = sys.arg[initSusp + 1]
    turn = sys.arg[initSusp + 2]
    asker = sys.arg[initSusp + 3]
    asked = sys.arg[initSusp + 4]
    who = sys.arg[initSusp + 5]
    where = sys.arg[initSusp + 6]
    what = sys.arg[initSusp + 7]
    hasSmg = sys.arg[initSusp + 8]
    suspCard = sys.arg[initSusp + 9]
    card = sys.arg[initSusp + 10]

    # Pasar el string suspCard a una matriz
    numPlayers = 6
    numThings = 18
    sospechas = [[random.choice([0,1,-1]) for _ in range(numPlayers)] for _ in range(numThings)]

    if lvl == 1:
        if turn == yo:
            if hasSmg:
                # printear sospechas
                print(sospechas)
            else:
                pass
                # suspCarf[][]
    else:
        pass


if __name__ == '__main__':

    checkArgs()
    print("This file is not meant to be run directly.")
    update()
    
