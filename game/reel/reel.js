class Reel {
    constructor(canvas, symbolSelectId, landingPositionSelectId) {
        this.symbolHeight = 121;
        this.spinSpeed = 10;                    // Spin element's movement interval in milliseconds
        this.nextSymbolIndex = 3;
        this.spinInProgress = false;            // Bool to disable 'Spin' button if spin already active
        this.canvas = canvas;
        this.symbolSelectId = symbolSelectId;
        this.landingPositionSelectId = landingPositionSelectId;
        // All symbols
        this.symbolSource = [
            { 
                imgSrc: './game/reel/img/Cherry.png',
                element: 'cherry' 
            },
            {
                imgSrc: './game/reel/img/7.png',
                element: 'seven'
            },
            {
                imgSrc: './game/reel/img/2xBAR.png',
                element: 'bar2'
            },
            {
                imgSrc: './game/reel/img/BAR.png',
                element: 'bar'
            },
            {
                imgSrc: './game/reel/img/3xBAR.png',
                element: 'bar3'
            }
        ];
        // Active symbols (symbols visible in the reel)
        this.activeSymbols = [
            {
                imgCoordinateY: this.symbolHeight*0,
                symbol: this.symbolSource[0]
            },
            {
                imgCoordinateY: this.symbolHeight,
                symbol: this.symbolSource[1]
            },
            {
                imgCoordinateY: this.symbolHeight*2,
                symbol: this.symbolSource[2]
            }    
        ];
        this.loadImages();
    }
    
    
    //-- Validate symbol rotation (if symbol falls out of reel's scope, raise it to the top and replace img)
    validateRotation(symbol) {
        if (symbol.imgCoordinateY > this.symbolHeight*2) {
            // Raise to the top
            symbol.imgCoordinateY -= this.symbolHeight*3;
            // Replace the img
            symbol.symbol = this.symbolSource[this.nextSymbolIndex];
            // Rotate images
            this.nextSymbolIndex++;
            if (this.nextSymbolIndex >= this.symbolSource.length) {
                this.nextSymbolIndex = 0;
            }
        }
    }
    
    
    //-- Move all symbols' coordinates down by 'addition' px
    moveCoordinatesDown(addition) {
        this.activeSymbols[0].imgCoordinateY += addition;
        this.validateRotation(this.activeSymbols[0]);
        this.activeSymbols[1].imgCoordinateY += addition;
        this.validateRotation(this.activeSymbols[1]);
        this.activeSymbols[2].imgCoordinateY += addition;
        this.validateRotation(this.activeSymbols[2]);
    }
    
    
    //-- Load reel images based on the coordinates
    loadImages() {
        const ctx = this.canvas.getContext("2d");
        // Define 'self' to access class scope
        const self = this;
    
        // Load images for visible reel symbols
        const tImg1 = new Image();
        tImg1.src = this.activeSymbols[0].symbol.imgSrc;
        const tImg2 = new Image();
        tImg2.src = this.activeSymbols[1].symbol.imgSrc;
        const tImg3 = new Image();
        tImg3.src = this.activeSymbols[2].symbol.imgSrc;
    
        // Once the last image is loaded, clear the canvas and redraw all the images
        tImg3.onload = function() {
            ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
            ctx.drawImage(tImg1, 0, self.activeSymbols[0].imgCoordinateY);
            ctx.drawImage(tImg2, 0, self.activeSymbols[1].imgCoordinateY);
            ctx.drawImage(tImg3, 0, self.activeSymbols[2].imgCoordinateY);
        }
    }
    
    
    //-- Reel spin loop 
    //-- (return promise)
    reelSpinLoop(loopDuration, moveStep = 1) {
        let d = jQuery.Deferred();
        let i = 1;
        // Define 'self' to access class scope
        const self = this;
    
        function myLoop () {
            setTimeout(function () {
                self.moveCoordinatesDown(moveStep);
                // console.log(`Coordinate1 ${symbols[0].imgCoordinateY}, 
                //             Coordinate2 ${symbols[1].imgCoordinateY}
                //             Coordinate3 ${symbols[2].imgCoordinateY}`);
            
                self.loadImages();
    
                i++;                    
                if (i < loopDuration) {            
                    myLoop();             
                } else {
                    d.resolve();
                }         
                // TODO: Add acceleration             
            }, self.spinSpeed)
        }
        myLoop();
        return d.promise();
    }
    
    
    //-- Calculate the missing distance to the next breakpoint (so that the reel would stop at a certain place)
    //-- (return Y coordinate distance to next breakpoint)
    missingBreakpointDistance(desiredLandingPosition, desiredSymbol) {
        const tHeight = this.symbolHeight;
        let missingYDistance = 0;
        if (!desiredLandingPosition && !desiredSymbol) {
            // Random outcome (stop at next breakpoint)

            // Get the Y coordinate of one of the active symbols
            const tCoordinateY = this.activeSymbols[0].imgCoordinateY;
            // Find and record the distance to the next breakpoint
            if (tCoordinateY <= 0) {
                missingYDistance = tCoordinateY*(-1);
            } else if (tCoordinateY <= tHeight/2) {
                missingYDistance = tHeight/2 - tCoordinateY;
            } else if (tCoordinateY <= tHeight) {
                missingYDistance = tHeight - tCoordinateY;
            } else if (tCoordinateY <= tHeight + tHeight/2) {
                missingYDistance = tHeight + tHeight/2 - tCoordinateY;
            } else if (tCoordinateY <= tHeight*2) {
                missingYDistance = tHeight*2 - tCoordinateY;
            }
        } else {
            // Fixed outcome (stop desired symbol in desired landing position)

            // Determine the coordinate of landing position
            let landingCoordinate = 0;
            if (desiredLandingPosition === 'top') {
                landingCoordinate = -1;
            } else if (desiredLandingPosition === 'mid') {
                landingCoordinate = 60;
            } else if (desiredLandingPosition === 'bottom') {
                landingCoordinate = 120;
            }
            
            // Find the distance to the desired symbol
            // Get the desired symbol's index from 'symbolSource' array
            const tDesiredSymbolIndex = this.symbolSource.findIndex(sym => sym.element === desiredSymbol);
            // Sort active symbols by Y coordinate (desc)
            const tSortedActiveSymbols = this.activeSymbols.sort((a, b) => {
                if (a.imgCoordinateY > b.imgCoordinateY) {
                    return -1;
                } else {
                    return 1;
                }
            });
            // Find the symbol above (Y coordinate less than) the landing coordinate
            const tLandingCoordinateNextSymbol = tSortedActiveSymbols.find(sym => sym.imgCoordinateY <= landingCoordinate);
            // Add the gap between next symbol and desired breakpoint to 'missingYDistance'
            missingYDistance += landingCoordinate-tLandingCoordinateNextSymbol.imgCoordinateY;
            // Get the next symbol's index from 'symbolSource' array
            const tNextSymbolIndex = this.symbolSource.findIndex(sym => sym.element === tLandingCoordinateNextSymbol.symbol.element);
            // Find how many symbols to loop through until the desired is reached
            let tIndexMissing = tDesiredSymbolIndex - tNextSymbolIndex; // If negative, add arr.length
            if (tIndexMissing < 0) {
                tIndexMissing += this.symbolSource.length;
            }
            // Add the gap between desired symbol and next symbol to 'missingYDistance' (adding 1 because of rounding)
            missingYDistance += tIndexMissing*tHeight + 1;
        }
        return missingYDistance;
    }
    
    
    //-- Spin the reel for 'loopDuration' loops in predetermined steps 
    //-- (return promise)
    spin(loopDuration) {
        this.spinInProgress = true;
        let c = jQuery.Deferred();
        // Define 'self' to access class scope
        const self = this;

        // Define spin nature (random or fixed)
        const reelOptionSymbol = $(`#${this.symbolSelectId}`).val();
        const reelOptionLandingPosition = $(`#${this.landingPositionSelectId}`).val();
        const randomSpin = (reelOptionSymbol === 'random' || reelOptionLandingPosition === 'random');

        const randStep = Math.floor((Math.random() * 30) + 10);     // Generate random movement interval for the reel
        // Initial spin
        this.reelSpinLoop(loopDuration, randStep)
            .then(function() {
                let additionalSpinDistance = 0;
                if (randomSpin) {
                    // If spin outcome is random
                    // Get the distance to the next breakpoint (so that the reel would stop at a specific place)
                    additionalSpinDistance = self.missingBreakpointDistance();
                } else {
                    // If spin outcome is fixed
                    // Get the distance of the desired symbol to the desired position
                    additionalSpinDistance = self.missingBreakpointDistance(reelOptionLandingPosition,reelOptionSymbol);
                }
                if (additionalSpinDistance > 0) {
                    // Execute additional spin (so that the reel would stop at a specific place)
                    self.reelSpinLoop(additionalSpinDistance)
                        .then(function() {
                            self.spinInProgress = false;
                            c.resolve();
                        });
                }
            });
    
        
        return c.promise();
    }
}