import { PlayerRole, Orientation } from '@nakniki/shared';

const P1 = PlayerRole.P1;
const P2 = PlayerRole.P2;
const H = Orientation.HORIZONTAL;
const V = Orientation.VERTICAL;

export const STEPS = [
    {
        title: 'The Goal',
        body: 'The first player to reach the other edge of the board wins! So you better go fast!',
        board: { pawns: [{ player: P1, r: 3, c: 1 }, { player: P2, r: 0, c: 1 }] },
    },
    {
        title: 'Moving',
        body: 'On your turn, you may step one square in a single direction: up, down, left, or right. The glowing squares show where your pawn can go.',
        board: { pawns: [{ player: P1, r: 2, c: 1 }], highlights: [{ r: 1, c: 1 }, { r: 3, c: 1 }, { r: 2, c: 0 }, { r: 2, c: 2 }] },
    },
    {
        title: 'Walls',
        body: 'Instead of moving, you may drop a wall to block a path. A wall spans two whole squares and pawns cannot cross it. You only get 10 walls per game, so use them wisely!',
        board: { pawns: [{ player: P1, r: 2, c: 1 }, { player: P2, r: 1, c: 1 }], walls: [{ r: 1, c: 0, orientation: H }] },
    },
    {
        title: 'Walls - Continuation',
        body: 'Delaying is allowed, and reccomended. But you are forbidden from completely block your opponent from winning — a path to their goal must always remain open.',
        board: { pawns: [{ player: P2, r: 1, c: 2 }], walls: [{ r: 1, c: 1, orientation: V }, { r: 0, c: 1, orientation: H }, { r: 2, c: 2, orientation: H}] },
    },
    {
        title: 'Jumping',
        body: 'When two pawns stand face to face, you may hop straight over your opponent.',
        board: { pawns: [{ player: P1, r: 2, c: 1 }, { player: P2, r: 1, c: 1 }], highlights: [{ r: 0, c: 1 }] },
    },
    {
        title: 'Jumping - Continuation',
        body: 'If jumping forward is not allowed due to walls, you may jump sideways along the wall.',
        board: { pawns: [{ player: P1, r: 2, c: 1 }, { player: P2, r: 1, c: 1 }], walls: [{r: 0, c: 1, orientation: H}], highlights: [{ r: 1, c: 0 }, { r: 1, c: 2 }] },
    },
    {
        title: "You're Nakniki-Ready!",
        body: 'First pawn to the far side wins. Place your walls wisely, plan your moves ahead, and outsmart your rival. Nakniki-Good luck!',
        board: { pawns: [{ player: P1, r: 0, c: 1 }] },
    },
];