codingame: https://www.codingame.com/ide/puzzle/2-player-game-on-a-calculator



```
A number N is displayed on the calculator. 

First player picks a digit d between 1 and 9.
N is replaced by N - d.
Second player does the same thing, but has to choose a key which is adjacent to the last one (but not the same one, you cannot repeat the digit select by the opponent).
Repeat until one player gets a negative number. He lost !

For example, we start with N = 20.

7  8  9

4  5  6

1  2  3

First player can pick any digit and hits 8.
N becomes 12.

7  x  9

4  5  6

*  *  *

Second player can pick 4, 5, 6, 7 or 9. He picks 9
N becomes 3.

*  8  x

*  5  6

*  *  *

First player can pick 5, 6 or 8. He picks 5.
N becomes -2.
First player has lost this game.

Your job is to find all winning moves in a starting situation.

Examples:
- if N = 1, then 1 is the only winning move (getting to 0 makes the other player lose since he will have to make N negative on his turn).
- if N = 8, then 5 is NOT a winning move (since second player can reply with 3).

Note: detailed specification of what is "near".

When 1 was selected, then 2, 4 or 5 can be selected.
When 2 was selected, then 1, 3, 4, 5 or 6 can be selected.
When 3 was selected, then 2, 5 or 6 can be selected.
When 4 was selected, then 1, 2, 5, 7, or 8 can be selected.
When 5 was selected, then 1, 2, 3, 4, 6, 7, 8 or 9 can be selected.
When 6 was selected, then 2, 3, 5, 8 or 9 can be selected.
When 7 was selected, then 4, 5 or 8 can be selected.
When 8 was selected, then 4, 5, 6, 7 or 9 can be selected.
When 9 was selected, then 5, 6, or 8 can be selected.
Input
Line 1 : An int N : the starting number
Output
Line 1 : 0 to 9 ints, separated with spaces, from lowest to highest. These are the winning moves when playing first and N is the starting number
Constraints
0 < N ≤ 100000
Example
Input
2
Output
1 2
```

상대방이 선택한 숫자가 a 라 할 때, N-a 가 음수를 만들게 되면 이기는 게임.

대표적인 DP 문제.

```
7 8 9
4 5 6
1 2 3
```
배열에서 이전의 선택한 숫자의 인접한 숫자만 선택할 수 있다.

S[N][B]: N 이 남았을 때, 이전의 플레이어가 선택한 숫자를 B. 이길 수 있다면 값은 1 이길 수 없다면 값은 0

위와 같이 배열을 정의한다.


그러면 N=0, S[N][0~9] = 0;

s[N][B]: s[N-b][b] == 0 이면 1
이 때, b 는 B와 인접한 숫자 배열.

```
    for(int N=1; N<=100001; N++) {
        for(int B=0; B<=9; B++) {
            for(auto b: adj[B]) {
                if(N - b >= 0 && s[N-b][b] == 0) {
                    s[N][B] = 1;
                }
            }
        }
    }
```

입력값 p 에 대해서 
s[p-i][i] == 0 인 값을 순서대로 출력하면 된다.


