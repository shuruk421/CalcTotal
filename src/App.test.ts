import { render, screen } from '@testing-library/react';
import * as Main from './main'

it("calcTotal all false", async () => {
    var expected: { [address: string]: number; } = {};
    let total = await Main.calcTotal(false, false, false);
    expect(total).toStrictEqual(expected);
});

it("calcTotal lp not null", async () => {
    let total = await Main.calcTotal(true, false, false);
    expect(total).not.toBe(null);
}, 20000); //20 seconds

it("SumWinnings correct", async () => {
    let total = await Main.SumWinnings([{winAmount: 1}, {winAmount: 2}]);
    expect(total).toBe(3);
});

it("toCSV first line", async () => {
    let firstLine = '"Address","Total",';
    let csv = await Main.toCSV([], []);
    expect(csv).toContain(firstLine);
});