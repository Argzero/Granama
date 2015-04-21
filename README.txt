My site adds a stats database extension to Granama which allows players to view 
theirs or others' stats by retrieving them from a MongoDB database.

I used the Express MVC framework, which takes care of handling HTML requests for
retrieving the related pages, structuring the database, sending requests to the
database, and also runs the server for the game.

I used MongoDB to manage storing the stats for players that they accumulate by
playing the game. Stats include kills, deaths, games, experience, etc.

For the pages themselves, I used Jade as the templating language to structure
them. They all extend a base class which pulls in the common styles/scripts 
and sets up common elements like the title.

Links:
app: https://granamamvc.herokuapp.com/game
repo: https://github.com/Eniripsa96/Granama/tree/MVC