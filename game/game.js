class Game {
    constructor(startingBalance, spinCost) {
        this.balance = startingBalance;
        this.spinCost = spinCost;
        this.reels = [
            new Reel(document.getElementById("reelCanvas1"), 'symbolSelectReel1', 'landingPositionReel1'),
            new Reel(document.getElementById("reelCanvas2"), 'symbolSelectReel2', 'landingPositionReel2'),
            new Reel(document.getElementById("reelCanvas3"), 'symbolSelectReel3', 'landingPositionReel3')
        ];
        this.tWinId = '';
    }


    //-- Determine whether the spin is in progress
    get spinInProgress() {
        const spinningReels = this.reels.filter(r => r.spinInProgress);
        if (spinningReels.length === 0) {
            return false;
        } else {
            return true;
        }
    }


    //-- Flash winning table element
    flashWinning(id) {
        const winElement = $(`#${id}`);
        for (let i=0; i<10; i++) {
            winElement.fadeOut(100).fadeIn(100);
        }
    }


    //-- Change the balance 
    //-- (return outcome: success=true)
    balanceChange(change) {
        if (!this.spinInProgress) {
            const balanceElement = $('#balanceVal');
            // If spin attempt fails due to invalid coins
            if (this.balance + change < 0) {
                alert("Invalid balance, insert coins!");
                return false;
            }
            this.balance += change;
            balanceElement.html(`Balance: ${this.balance}`);
            for (let i=0; i<2; i++) {
                balanceElement.fadeOut(200).fadeIn(200);
            }
        }
        return true;
    }


    //-- Execute spin
    spin() {
        const self = this;
        // Deduct spin cost from balance
        if (this.balanceChange(this.spinCost)) {
            //Spin the reels (if all 3 are still)
            if (!this.spinInProgress) {
                let promises = [
                    this.reels[0].spin(200),
                    this.reels[1].spin(250),
                    this.reels[2].spin(300)
                ];
                
                // Get outcome after all reels have finished spinning
                $.when.apply($, promises).then(function() {
                    self.getOutcome();
                }, function(e) {
                    console.error(new Error(e));
                });

            }
        }
    }


    //-- Sort symbols by lines for inputted reel
    sortSymbolsByLines(reel, outcomeObj) {
        let tIndex = 0;
        // Top line
        tIndex = reel.activeSymbols.findIndex(y => y.imgCoordinateY === -1);
        if (tIndex >= 0) {
            outcomeObj.topLine.push(reel.activeSymbols[tIndex].symbol.element);
        }
        // Mid line
        tIndex = reel.activeSymbols.findIndex(y => y.imgCoordinateY === 60);
        if (tIndex >= 0) {
            outcomeObj.midLine.push(reel.activeSymbols[tIndex].symbol.element);
        }
        // Bottom line
        tIndex = reel.activeSymbols.findIndex(y => y.imgCoordinateY === 120);
        if (tIndex >= 0) {
            outcomeObj.bottomLine.push(reel.activeSymbols[tIndex].symbol.element);
        }
    }


    //-- Check line for win combinations 
    //-- (return win amount)
    winningCombination(lineData, lineDescription) {
        // 3xCherry
        if (lineData[0] && lineData[1] && lineData[2] && lineData[0] === 'cherry' && lineData[1] === 'cherry' && lineData[2] === 'cherry') {
            if (lineDescription === 'top') {
                this.tWinId = 'topCherry';
                return 2000;
            } else if (lineDescription === 'mid') {
                this.tWinId = 'midCherry';
                return 1000;
            } else if (lineDescription === 'bottom') {
                this.tWinId = 'bottomCherry';
                return 4000;
            }
        // 3xSeven
        } else if (lineData[0] && lineData[1] && lineData[2] && lineData[0] === 'seven' && lineData[1] === 'seven' && lineData[2] === 'seven') {
            if (lineDescription === 'top') {
                this.tWinId = 'topSeven';
            } else if (lineDescription === 'mid') {
                this.tWinId = 'midSeven';
            } else if (lineDescription === 'bottom') {
                this.tWinId = 'bottomSeven';
            }
            return 150;
        // Cherry & Seven
        } else if (lineData.includes('cherry') && lineData.includes('seven')) {
            if (lineDescription === 'top') {
                this.tWinId = 'topCherrySeven';
            } else if (lineDescription === 'mid') {
                this.tWinId = 'midCherrySeven';
            } else if (lineDescription === 'bottom') {
                this.tWinId = 'bottomCherrySeven';
            }
            return 75;
        // 3xBar3
        } else if (lineData[0] && lineData[1] && lineData[2] && lineData[0] === 'bar3' && lineData[1] === 'bar3' && lineData[2] === 'bar3') {
            if (lineDescription === 'top') {
                this.tWinId = 'topBar3';
            } else if (lineDescription === 'mid') {
                this.tWinId = 'midBar3';
            } else if (lineDescription === 'bottom') {
                this.tWinId = 'bottomBar3';
            }
            return 50;
        // 3xBar2
        } else if (lineData[0] && lineData[1] && lineData[2] && lineData[0] === 'bar2' && lineData[1] === 'bar2' && lineData[2] === 'bar2') {
            if (lineDescription === 'top') {
                this.tWinId = 'topBar2';
            } else if (lineDescription === 'mid') {
                this.tWinId = 'midBar2';
            } else if (lineDescription === 'bottom') {
                this.tWinId = 'bottomBar2';
            }
            return 20;
        // 3xBar
        } else if (lineData[0] && lineData[1] && lineData[2] && lineData[0] === 'bar' && lineData[1] === 'bar' && lineData[2] === 'bar') {
            if (lineDescription === 'top') {
                this.tWinId = 'topBar';
            } else if (lineDescription === 'mid') {
                this.tWinId = 'midBar';
            } else if (lineDescription === 'bottom') {
                this.tWinId = 'bottomBar';
            }
            return 10;
        // 3xAny bar
        } else if (lineData[0] && lineData[1] && lineData[2] && lineData[0].includes('bar') && lineData[1].includes('bar') && lineData[2].includes('bar')) {
            if (lineDescription === 'top') {
                this.tWinId = 'topBarAny';
            } else if (lineDescription === 'mid') {
                this.tWinId = 'midBarAny';
            } else if (lineDescription === 'bottom') {
                this.tWinId = 'bottomBarAny';
            }
            return 5;
        } else {
            return 0;
        }
    }


    //-- Get the outcome of the spin
    getOutcome() {
        let bestPossibleOutcome = 0;
        let bestPossibleLine = '';
        let bestPossibleWinId = '';

        // Fetch reels data (get symbols for top, mid and bottom lines)
        const linesOutcome = {
            topLine: [],
            midLine: [],
            bottomLine: []
        }
        this.sortSymbolsByLines(this.reels[0], linesOutcome);
        this.sortSymbolsByLines(this.reels[1], linesOutcome);
        this.sortSymbolsByLines(this.reels[2], linesOutcome);
        // console.log(`Spin outcome:
        //                 TOP = ${linesOutcome.topLine}
        //                 MID = ${linesOutcome.midLine}
        //                 BOTTOM = ${linesOutcome.bottomLine}`);

        // Compare lines to outcome table and find out the best possible outcome & line
        let tWin = this.winningCombination(linesOutcome.topLine, 'top');
        if (tWin > bestPossibleOutcome) {
            bestPossibleOutcome = tWin;
            bestPossibleLine = 'top';
            bestPossibleWinId = this.tWinId;
        }
        tWin = this.winningCombination(linesOutcome.midLine, 'mid');
        if (tWin > bestPossibleOutcome) {
            bestPossibleOutcome = tWin;
            bestPossibleLine = 'mid';
            bestPossibleWinId = this.tWinId;
        }
        tWin = this.winningCombination(linesOutcome.bottomLine, 'bottom');
        if (tWin > bestPossibleOutcome) {
            bestPossibleOutcome = tWin;
            bestPossibleLine = 'bottom';
            bestPossibleWinId = this.tWinId;
        }
        // React on results
        // On positive/winning outcome
        if (bestPossibleOutcome > 0) {
            alert(`You won! Win amount: ${bestPossibleOutcome}`);
            this.flashWinning(bestPossibleWinId);
            this.balanceChange(bestPossibleOutcome);
        }
    }
}