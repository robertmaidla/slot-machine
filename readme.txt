-- Slot machine application

No frameworks were been used to develop this application.

Game enters from index.js. 2 main classes are used to handle the objectives: Game and Reel.

Game class holds the reels, keeps track of the balance, triggers the spins and calculates the outcome.

Reel class holds the reel data and handles the spinning mechanism.

The debug area can be used to fix the outcome of the reel. 
Note that both the 'Symbol' and 'Landing Position' have to be set for the outcome to be fixed.
In case of a fixed outcome, the spin will run for default amount of seconds before starting to 
look for the fixed element.