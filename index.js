// Init game
const game = new Game(0, -1);

// On 'Insert coin(s)'
document.getElementById('balanceSubmit').addEventListener('click', function(e) {
    e.preventDefault();
    const input = document.getElementById('balanceInput').value;
    if (input > 0 && input <= 5000) {
        game.balanceChange(Number(input));
    } else {
        alert("Invalid amount! Allowed to insert 1...5000")
    }
})

// On 'SPIN' button
function spinReelsButton() {
    if(!game.spinInProgress) {
        // Spin the reels
        game.spin();
    }

}