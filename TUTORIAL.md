# How to unit-test asynchronous code for javascript in 2020

![asyncFn](https://raw.githubusercontent.com/team-igniter-from-houston-inc/async-fn/master/logo.png)

**asyncFn** provides additional methods to eg. [jest.fn](https://www.npmjs.com/package/@async-fn/jest) or [sinon.spy](https://www.npmjs.com/package/@async-fn/sinon) to introduce "**late resolve**" for the promises returned.

This simplifies async unit testing by allowing tests that read chronologically, **like a story**.

## The story begins

The text you are about to consume describes an imaginary dialog between two programmers on their way to discover the _orgastic pleasures_ of **asyncFn**.

Be warned that we'll also cover topics such as TDD, evil pairing, and "negation testing". They are not the main topic here, but some words are spared for them nonetheless to justify way of thinking.

Best of luck, _Dear Reader_.

### Chapter 1: The premise and the foundation

> **Fry**: My name is Fry, and I find it difficult to **unit test** async-stuff in javascript.

> **Leela**: Tell me more.

> **Fry**: Yup, say I wanted to implement something to this specification:

```gherkin
Feature: As a player, I can play a game called Monster Beatdown

    Scenario: I can damage an encountered monster
        Given I encounter a monster
        And I choose to attack it
        Then the monster loses hit points

    Scenario: I can try flee a monster
        Given I encounter a monster
        And I choose to flee
        Then the monster eats me
        And I lose

    Scenario: I can win the game by beating a monster until it is knocked out
        Given I encounter a monster
        When I attack it until it has no hit points
        Then the monster is knocked out
        And I win
```

> **Fry**: The kicker here is that in this game, prompting the player for action is asynchronous.

> **Leela**: Mm-hmm, I think I get it. Let's get our hands dirty and see where it lands us.

> **Fry**: Here's an initial test for good measure:

```javascript
import gameWithoutDependencies from './monsterBeatdown';

it('when a monster is encountered, informs the player of this', () => {
  const messagePlayerMock = jest.fn();
  const game = gameWithoutDependencies({
    messagePlayer: messagePlayerMock,
  });

  game.encounterMonster();

  expect(messagePlayerMock).toHaveBeenCalledWith(
    'You encounter a monster with 5 hit-points.',
  );
});
```

Contents of `./monsterBeatdown.js` so far:

```javascript
export default ({ messagePlayer }) => ({
  encounterMonster: () => {
    messagePlayer(`You encounter a monster with 5 hit-points.`);
  },
});
```

> **Leela**: Ok, so far so good. I see you chose to **inject** the mock-function for messaging the player as an argument for the function we are testing. Crystal. Full steam ahead.

> **Fry**: Right on. Next up will be my vision for asking the player if she wants to attack, and if not, she loses.

### Chapter 2: The problems emerge

```javascript
import gameWithoutDependencies from './monsterBeatdown';

it('when a monster is encountered, informs the player of this', async () => {
  const messagePlayerMock = jest.fn();
  const game = gameWithoutDependencies({
    messagePlayer: messagePlayerMock,
  });

  await game.encounterMonster();

  expect(messagePlayerMock).toHaveBeenCalledWith(
    'You encounter a monster with 5 hit-points.',
  );
});

it('when a monster is encountered, asks player to attack', async () => {
  const askPlayerToHitMock = jest.fn();
  const game = gameWithoutDependencies({
    askPlayerToHit: askPlayerToHitMock,
  });

  await game.encounterMonster();

  expect(askPlayerToHitMock).toHaveBeenCalledWith('Do you want to attack it?');
});

it('given a monster is encountered, when player chooses to flee, the monster eats the player', async () => {
  // When asked to attack, choosing false means to flee.
  const askPlayerToHitMock = jest.fn(() => Promise.resolve(false));

  const messagePlayerMock = jest.fn();

  const game = gameWithoutDependencies({
    askPlayerToHit: askPlayerToHitMock,
    messagePlayer: messagePlayerMock,
  });

  await game.encounterMonster();

  expect(messagePlayerMock).toHaveBeenCalledWith(
    'You chose to flee the monster, but the monster eats you in disappointment.',
  );
});

it('given a monster is encountered, when player chooses to flee, the game is over', async () => {
  const askPlayerToHitMock = jest.fn(() => Promise.resolve(false));

  const messagePlayerMock = jest.fn();

  const game = gameWithoutDependencies({
    askPlayerToHit: askPlayerToHitMock,
    messagePlayer: messagePlayerMock,
  });

  await game.encounterMonster();

  expect(messagePlayerMock).toHaveBeenCalledWith('Game over.');
});
```

Contents of `./monsterBeatdown.js` so far:

```javascript
export default ({ messagePlayer = () => {}, askPlayerToHit = () => {} }) => ({
  encounterMonster: () => {
    // For real life, the implementation below makes little sense.
    // This is intentional, and is so to prove a point later.
    // At this point, it suffices that all tests are green
    messagePlayer('Game over.');

    messagePlayer('You encounter a monster with 5 hit-points.');

    askPlayerToHit('Do you want to attack it?');

    messagePlayer(
      'You chose to flee the monster, but the monster eats you in disappointment.',
    );
  },
});
```

> **Leela**: Hold the phone. I see two problems here. One is the **duplication**, and the other one is about the test describing occurrences in **non-chronological** order, making the test harder to read. Let's start by fixing the first problem.

### Chapter 3: The clumsy fix

> **Fry**: Uh, I was just about to remove the duplication anyway. Red-green-refactor, right?

> **Leela**: Right.

```javascript
import gameWithoutDependencies from './monsterBeatdown';

describe('given a monster is encountered', () => {
  let askPlayerToHitMock;
  let messagePlayerMock;
  let game;

  beforeEach(() => {
    askPlayerToHitMock = jest.fn();
    messagePlayerMock = jest.fn();

    game = gameWithoutDependencies({
      askPlayerToHit: askPlayerToHitMock,
      messagePlayer: messagePlayerMock,
    });
  });

  it('informs the player of this', async () => {
    await game.encounterMonster();

    expect(messagePlayerMock).toHaveBeenCalledWith(
      'You encounter a monster with 5 hit-points.',
    );
  });

  it('asks player to attack', async () => {
    await game.encounterMonster();

    expect(askPlayerToHitMock).toHaveBeenCalledWith(
      'Do you want to attack it?',
    );
  });

  describe('when player chooses to flee', () => {
    beforeEach(async () => {
      // When asked to attack, choosing false means to flee.
      askPlayerToHitMock.mockResolvedValue(false);

      await game.encounterMonster();
    });

    it('player is informed of the grim outcome', () => {
      expect(messagePlayerMock).toHaveBeenCalledWith(
        'You chose to flee the monster, but the monster eats you in disappointment.',
      );
    });

    it('the game is over', () => {
      expect(messagePlayerMock).toHaveBeenCalledWith('Game over.');
    });
  });
});
```

Contents of `./monsterBeatdown.js` so far:

```javascript
// no changes, as only tests were refactored.
```

> **Fry**: There. Now the duplication for the test setup has been removed, but only to a degree. However, the problem of test not being written in chronological order prevents us from removing all the duplication. See how we are forced to repeat game.encounterMonster(), because askPlayerToHitMock needs to know how to behave **before** it is called.
>
> Worse yet, this makes the "describe" **dishonest**, as it claims to display how "given a monster is encountered", but in reality this is something that happens only later in test setup.
>
> All this kind of bums me out, and I've felt the pain of this getting out of hand as in real life requirements and features start to pile up.

> **Leela**: I see. Let's now introduce **asyncFn** as an expansion to the normal jest.fn.
>
> Behold.

### Chapter 4: The beholding of asyncFn

```javascript
import gameWithoutDependencies from './monsterBeatdown';
import asyncFn from '@asyncFn/jest';

describe('given a monster is encountered', () => {
  let askPlayerToHitMock;
  let messagePlayerMock;
  let game;

  beforeEach(() => {
    // Note: Before we used jest.fn here instead of asyncFn.
    askPlayerToHitMock = asyncFn();
    messagePlayerMock = jest.fn();

    game = gameWithoutDependencies({
      askPlayerToHit: askPlayerToHitMock,
      messagePlayer: messagePlayerMock,
    });

    game.encounterMonster();
  });

  it('informs the player of this', async () => {
    expect(messagePlayerMock).toHaveBeenCalledWith(
      'You encounter a monster with 5 hit-points.',
    );
  });

  it('asks player to attack', () => {
    // Note how even if askPlayerToHitMock is now a mock made using asyncFn(), it still is a jest.fn(). This means eg. toHaveBeenCalledWith can be used with it.
    expect(askPlayerToHitMock).toHaveBeenCalledWith(
      'Do you want to attack it?',
    );
  });

  describe('when player chooses to flee', () => {
    beforeEach(async () => {
      // Note how choosing false here still means fleeing combat, but here we use asyncFn's .resolve() to control the outcome. And then we await for the consequences of that.
      await askPlayerToHitMock.resolve(false);
    });

    it('player is informed of the grim outcome', () => {
      expect(messagePlayerMock).toHaveBeenCalledWith(
        'You chose to flee the monster, but the monster eats you in disappointment.',
      );
    });

    it('the game is over', () => {
      expect(messagePlayerMock).toHaveBeenCalledWith('Game over.');
    });
  });
});
```

Contents of `./monsterBeatdown.js` so far:

```javascript
// no changes, as only tests were refactored.
```

> **Leela**: Now the duplication is gone, and everything takes place in a clean, chronological order. It kind of reads like a story, don't you think?

> **Fry**: Mm-hmm. I see it. I have a good feeling about it. But there's something bothering me with the production code. I see that the tests are all green, but clearly the code does not do anything sensical. It just blows through, merely satisfying the tests.

> **Leela**: You got me there. It's something called "evil pairing". If you want to mold the production code your way, you need to order it from the universe by writing a test. Let me show you how.

### Chapter 5: Evil is good and negation is positive

```javascript
import gameWithoutDependencies from './monsterBeatdown';
import asyncFn from '@asyncFn/jest';

describe('given a monster is encountered', () => {
  let askPlayerToHitMock;
  let messagePlayerMock;
  let game;

  beforeEach(() => {
    askPlayerToHitMock = asyncFn();
    messagePlayerMock = jest.fn();

    game = gameWithoutDependencies({
      askPlayerToHit: askPlayerToHitMock,
      messagePlayer: messagePlayerMock,
    });

    game.encounterMonster();
  });

  it('informs the player of this', async () => {
    expect(messagePlayerMock).toHaveBeenCalledWith(
      'You encounter a monster with 5 hit-points.',
    );
  });

  it('asks player to attack', () => {
    expect(askPlayerToHitMock).toHaveBeenCalledWith(
      'Do you want to attack it?',
    );
  });

  // This is the "negation test" referred later in narrative.
  it('when player has not chosen anything yet, the is not eaten', () => {
    expect(messagePlayerMock).not.toHaveBeenCalledWith(
      'You chose to flee the monster, but the monster eats you in disappointment.',
    );
  });

  // This is another negation test.
  it('when player has not chosen anything yet, the game is not over', () => {
    expect(messagePlayerMock).not.toHaveBeenCalledWith('Game over.');
  });

  describe('when player chooses to flee', () => {
    beforeEach(async () => {
      await askPlayerToHitMock.resolve(false);
    });

    it('player is informed of the grim outcome', () => {
      expect(messagePlayerMock).toHaveBeenCalledWith(
        'You chose to flee the monster, but the monster eats you in disappointment.',
      );
    });

    it('the game is over', () => {
      expect(messagePlayerMock).toHaveBeenCalledWith('Game over.');
    });
  });

  describe('when player chooses to attack', () => {
    beforeEach(async () => {
      await askPlayerToHitMock.resolve(true);
    });

    // Another negation test
    it('player does not lose', () => {
      expect(messagePlayerMock).not.toHaveBeenCalledWith(
        'You chose to flee the monster, but the monster eats you in disappointment.',
      );
    });

    it('the game is over', () => {
      expect(messagePlayerMock).toHaveBeenCalledWith('Game over.');
    });
  });
});
```

Contents of `./monsterBeatdown.js` so far:

```javascript
export default ({ messagePlayer, askPlayerToHit }) => ({
  encounterMonster: async () => {
    messagePlayer('You encounter a monster with 5 hit-points.');

    const playerChoseToAttack = await askPlayerToHit(
      'Do you want to attack it?',
    );

    if (!playerChoseToAttack) {
      messagePlayer(
        'You chose to flee the monster, but the monster eats you in disappointment.',
      );
    }

    messagePlayer('Game over.');
  },
});
```

> **Leela**: There. I've reduced the "evilness" of the code by adding something we call a "negation tests". By writing tests that describe what is not supposed to happen we forced the production code to make a little bit more sense.
>
> And if you are wondering where the name "evil pairing" comes from, it comes from playing **unit-testing ping-pong** in such a way that the production code is always written in the most evil way, ie. it is non-sensical for real life, yet still makes the tests green. The only way out of this is to force sense in production through unit tests. 
>
> You can tell coders are evil pairing from the evil laughter.
>
> As a practice, this "evil pairing -mentality" produces code that is very robust for the sake of refactoring, and also helps programmers hone their TDD-mojo a little bit.
>
> But I digress. However important this may be, it is slightly off-course. What is relevant is that asyncFn supports evil pairing as line of thinking. Motor on?

### Chapter 6: The multiplicity challenge and the enlightenment

> **Fry**: For sure. Can we see how the game develops some steps further? Particularly, I've been suffering with testing functions that are called multiple times, but still return promises.

> **Leela**: I feel you. My guess is an asyncFn-mock will get called multiple times soon enough, when we start choosing to attack the monster multiple times. Let's see how that pans out.

```javascript
import gameWithoutDependencies from './monsterBeatdown';
import asyncFn from '@asyncFn/jest';

describe('given a monster is encountered', () => {
  let askPlayerToHitMock;
  let messagePlayerMock;
  let game;

  beforeEach(() => {
    askPlayerToHitMock = asyncFn();
    messagePlayerMock = jest.fn();

    game = gameWithoutDependencies({
      askPlayerToHit: askPlayerToHitMock,
      messagePlayer: messagePlayerMock,
    });

    game.encounterMonster();
  });

  it('informs the player of this', async () => {
    expect(messagePlayerMock).toHaveBeenCalledWith(
      'You encounter a monster with 5 hit-points.',
    );
  });

  it('asks player to attack', () => {
    expect(askPlayerToHitMock).toHaveBeenCalledWith(
      'Do you want to attack it?',
    );
  });

  it('when player has not chosen anything yet, the game is not lost', () => {
    expect(messagePlayerMock).not.toHaveBeenCalledWith('Game over.');
  });

  describe('when player chooses to flee', () => {
    beforeEach(async () => {
      await askPlayerToHitMock.resolve(false);
    });

    it('player is informed of the grim outcome', () => {
      expect(messagePlayerMock).toHaveBeenCalledWith(
        'You chose to flee the monster, but the monster eats you in disappointment.',
      );
    });

    // Note: This is another negation test.
    it('the game not won', () => {
      expect(messagePlayerMock).not.toHaveBeenCalledWith(
        'You knock out the monster. You are a winner.',
      );
    });

    it('the game is over', () => {
      expect(messagePlayerMock).toHaveBeenCalledWith('Game over.');
    });
  });

  it('when player hits the monster, the monster loses a hit-point', async () => {
    await askPlayerToHitMock.resolve(true);

    expect(messagePlayerMock).toHaveBeenCalledWith(
      'You hit the monster. It now has 4 hit-points remaining.',
    );
  });

  describe('when player hits the monster enough times to knock it out', () => {
    beforeEach(async () => {
      // Here the monster is attacked multiple time, and therefore, askPlayerToHitMock is called multiple times, and then the test resolves it multiple times.

      // Using asyncFn, the logic remains the same: things that happen are written and observed in chronological order.
      await askPlayerToHitMock.resolve(true);
      await askPlayerToHitMock.resolve(true);
      await askPlayerToHitMock.resolve(true);
      await askPlayerToHitMock.resolve(true);
      await askPlayerToHitMock.resolve(true);
    });

    it('does not show out-of-place message about no hit-points', () => {
      expect(messagePlayerMock).not.toHaveBeenCalledWith(
        'You hit the monster. It now has 0 hit-points remaining.',
      );
    });

    it('player is congratulated', () => {
      expect(messagePlayerMock).toHaveBeenCalledWith(
        'You knock out the monster. You are a winner.',
      );
    });

    it('game is won', () => {
      expect(messagePlayerMock).toHaveBeenCalledWith('Game over.');
    });

    // Note: Another negation test.
    it('the game is not lost', () => {
      expect(messagePlayerMock).not.toHaveBeenCalledWith(
        'You chose to flee the monster, but the monster eats you in disappointment.',
      );
    });
  });

  // Note: Yet another negation test.
  it('when player hits the monster until it only has 1 hit-point remaining, the game is not over yet', async () => {
    // Hit the monster only 4 times instead of 5.
    await askPlayerToHitMock.resolve(true);
    await askPlayerToHitMock.resolve(true);
    await askPlayerToHitMock.resolve(true);
    await askPlayerToHitMock.resolve(true);

    expect(messagePlayerMock).not.toHaveBeenCalledWith('Game over.');
  });
});
```

Contents of final `./monsterBeatdown.js`:

```javascript
export default ({ askPlayerToHit, messagePlayer }) => ({
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
```

> **Leela**: There. Now the monster gets hit multiple times, all while things still happen in clear order.
>
> Side note: Did you notice how now there's more negation tests? As a byproduct of implementing the game using TDD and evil pairing, the negation tests make it even harder to break the code when eg. adding new features and doing refactoring.

> **Fry**: Color me enlightened. This has changed my view of the world as a programmer and a human being. I shall make sacrifices in your honor.

## Who made this?

asyncFn is lovingly crafted by Your pals at **Team: Igniter from [Houston Inc. Consulting](https://houston-inc.com)**.

We are a software development team of **friends**, with proven tradition in professional excellence. We specialize in holistic rapid deployments without sacrificing quality.

Come say hi at [Gitter](https://gitter.im/async-fn/community), [email](mailto:igniter@houston-inc.com) us, or check out the [team's website](https://team.igniter.houston.io). We just might be open for hire ;)
