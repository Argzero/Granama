function Player(gamepadIndex) {
    return {
        input: (gamepadIndex == -1 ? StandardInput() : GamepadInput(0)),
        robot: undefined
    };
}