#Backlog

##Final goal:
Create and deploy an RTS game. 
Implement the following features:
    list of features here...

##Issues:
    - Buildings should implement an abstract class that is reponsible for having
actions like building a unit.
    - Workers should implement the abstract class above and have actions to
place and build buildings.
    - Buildings should mark the map and not be passable by units.
    - On game over we need the following:
        - Create and save a post game analitycs
        - Present them using charts and diagrams after the game
        - Delete data from the Redis and Mongo databases that we not gonna need
anymore
    - Implement Elo system like all competetive games (chess).
    - Fix reroutings within nginx 
    - Setup env for local development and production.
    - Figure out a way to test the game.
    - Make sure to figure out how to stop the interval and only update the games
that are currently running. I somehow sure there are holes in my logic.
    - Make a list of classes and abstractions that are needed to be reworked or
implemented in other ways.
    - Deploy it with terraform to AWS eks.
    - Reduce docker images sizes if possible.
    - Add monitoring tools like helm and figure out a way to make use of it.
    - In the client players should queue up for a game and find opponent within
the same elo as they are.
    - On custom games implement being ready for a game.
    - Maps should not place resources on tiles that are not possible to get to.
    - Bring back the mapgenerator feature.
    - Leaderboard and divisions.
    - Remove all unused logic.
