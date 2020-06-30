export default ({ askPlayerToHit = () => {}, messagePlayer = () => {} }) => ({
  encounterMonster: async () => {
    let monsterHitPoints = 5;

    messagePlayer(
      `You encounter a monster with ${monsterHitPoints} hit-points.`,
    );

    while (await askPlayerToHit('Do you want to attack it?')) {
      monsterHitPoints--;

      if (monsterHitPoints === 0) {
        break;
      }

      messagePlayer(
        `You hit the monster. It now has ${monsterHitPoints} hit-points remaining.`,
      );
    }

    if (monsterHitPoints === 0) {
      messagePlayer('You knock out the monster. You are a winner.');
    } else {
      messagePlayer(
        'You chose to flee the monster, but the monster eats you in disappointment.',
      );
    }

    messagePlayer('Game over.');
  },
});
