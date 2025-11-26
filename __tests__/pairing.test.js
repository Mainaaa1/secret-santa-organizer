const generatePairs = require('../js/pairing');

describe('generatePairs', () => {
  test('simple 3-person pairing has no self matches', () => {
    const names = ['Alice','Bob','Carol'];
    const exclusions = [];
    const pairs = generatePairs(names, exclusions);
    expect(pairs).toHaveLength(3);
    pairs.forEach(p => {
      expect(p.giver).not.toBe(p.receiver);
    });
  });

  test('respects exclusions and throws when impossible', () => {
    const names = ['A','B','C'];
    // Make it impossible: A cannot B,C; B cannot A,C; C cannot A,B
    const exclusions = [
      { giver: 'A', receiver: 'B' },
      { giver: 'A', receiver: 'C' },
      { giver: 'B', receiver: 'A' },
      { giver: 'B', receiver: 'C' },
      { giver: 'C', receiver: 'A' },
      { giver: 'C', receiver: 'B' }
    ];
    expect(() => generatePairs(names, exclusions)).toThrow();
  });
});
