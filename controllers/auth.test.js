const test = number => {
    return Number(number) + 5;
};

describe('testAdding', () => {
    it('should verify that the answer equals 128', () => {
        expect(test('123')).toBe(128);
    });
    it('should be success', () => {
        expect(test(123)).toBe(128);
    });
});
