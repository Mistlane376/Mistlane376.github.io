---
title: 区间DP
date: 2026-09-23 15:00:00
tags:
  - 算法
  - ACM
categories:
  - 算法学习
description: 区间DP的知识整理
cover: /images/初音.webp
abbrlink: Interval DP
---

> 学习视频：
>
> 【算法讲解076【必备】区间dp-上】 https://www.bilibili.com/video/BV1NQ4y1b7Uo/?share_source=copy_web&vd_source=1c3ab528d43fbb1865a48fc150dbf09d
>
> 【算法讲解077【必备】区间dp-下】 https://www.bilibili.com/video/BV1du4y1L7gy/?share_source=copy_web&vd_source=1c3ab528d43fbb1865a48fc150dbf09d

# 区间DP的学习

**区间dp**：大范围的问题拆分成若干小范围的问题来求解。

状态几乎总是长成这样：

$$f[i][j] \quad \text{表示区间 } [i, j] \text{ 上的某种最优解}$$

答案通常是 $f[1][n]$。

可能性展开的常见方式：

1) **基于两侧端点**讨论的可能性展开
2) **基于范围上划分点**的可能性展开

下面先把这套框架讲透，再上题。

## 一、框架

### 1. 状态

$ f[i][j] $ 表示对 $[i,j]$ 这个区间做某种操作的最优结果。**先定状态，再想转移**——定状态时问自己一句：「这个区间算完后，我还想知道什么？」

### 2. 转移的两种来源

**来源一：靠两端点**

$[i,j]$ 的最优解，从「少一个端点」的更小区间推过来：

$$f[i][j] = \text{combine}\big(f[i+1][j],\; f[i][j-1],\; f[i+1][j-1]\big)$$

常见于：回文划分、括号匹配、**从两端取数的博弈**。

**来源二：靠划分点**

在 $[i,j]$ 中间选一个划分点 $k$，把区间切成左右两半分别求解：

$$f[i][j] = \min_{i \le k < j}\big(f[i][k] + f[k+1][j]\big) + \text{cost}$$

常见于：合并石子、三角剖分、字符串合并、矩阵链乘法。

> 两种来源的区别只有一句话：前者是「端点能不能配在一起」，后者是「在哪里切一刀」。看题时先判断属于哪一类。

### 3. 枚举顺序

$f[i][j]$ 依赖的区间**严格更短**，所以必须按区间长度从小到大推：

```cpp
for (int len = 1; len <= n; len++)            // 区间长度
    for (int i = 1; i + len - 1 <= n; i++)    // 左端点
    {
        int j = i + len - 1;                  // 右端点
        // 转移
    }
```

这个三层/四层循环骨架，**区间 dp 里几乎所有题目都长这样**，只改里面那几行。

### 4. 递推还是记忆化

递推按 `len` 循环，硬算所有 $f[i][j]$；记忆化写 `dfs(i, j)` 加备忘录，只算用到的状态。

- 递推：快，但边界（空区间、单点）要自己初始化好
- 记忆化：好写，**博弈类、带条件剪枝的题目首选**

两者结果完全等价。

### 5. 统一代码模板

```cpp
#include <bits/stdc++.h>
using namespace std;
#define IOS ios::sync_with_stdio(false); cin.tie(0); cout.tie(0)
#define endl "\n"
#define int long long
#define ld long double
const int mod1 = 1e9 + 7;
const int mod2 = 998244353;
const double PI = acos(-1.0), eps = 1e-12L;
const long long inf = 1e18 + 10;

void solve(){}

signed main(){
    IOS;
    int T = 1;
    // cin>>T;
    while (T--) solve();
    return 0;
}
```

> 下面每个例题的代码都基于这个模板，**省略了头文件和 main**，直接看 `solve()` 里写什么就行。

---

# 例题练习

## 例1 [P1435 IOI 2000\] 回文字串](https://www.luogu.com.cn/problem/P1435)

### 题意

给一个长度为 $n$（$n < 5000$）的字符串，把它切成若干段，要求每段都是回文串，求**最少的段数**。

### 思路

这是「靠划分点」和「靠两端点」都能写的题，先写最好懂的二维版本。

**第一步：预处理 $p[i][j]$，判断 $[i,j]$ 是不是回文串**

$$p[i][i] = 1, \qquad p[i][j] = \big(s_i = s_j\big) \land \big(j - i < 3 \lor p[i+1][j-1]\big)$$

**第二步：$f[i][j]$ 表示区间 $[i,j]$ 切成的最少回文段数**

$$f[i][j] = \begin{cases} 1, & p[i][j] \\ \min\limits_{i \le k < j}\big(f[i][k] + f[k+1][j]\big), & \text{otherwise} \end{cases}$$

时间 $O(n^3)$，空间 $O(n^2)$。

### 代码（理解用，二维版本）

```cpp
const int N = 5010;
char s[N];
bool p[N][N];
short f[N][N];

void solve(){
    int n; cin>>n>>s+1;
    for (int i=1;i<=n;i++) p[i][i]=1;
    for (int len=2; len<=n; len++)
        for (int i=1; i+len-1<=n; i++){
            int j = i+len-1;
            p[i][j] = (s[i]==s[j]) && (len==2 || p[i+1][j-1]);
        }
    for (int len=1; len<=n; len++)
        for (int i=1; i+len-1<=n; i++){
            int j = i+len-1;
            f[i][j] = p[i][j] ? 1 : n;      // 初值取 n 足够大：段数 ≤ 区间长度 ≤ n
            for (int k=i; k<j; k++)
                f[i][j] = min(f[i][j], (short)(f[i][k] + f[k+1][j]));
        }
    cout<<f[1][n]<<endl;
}
```

`short` 是省空间用的：`f[5010][5010]` 用 `int` 要 100MB，用 `short` 只要 50MB。代价是**初值不能再写 `1e9`**——`short` 装不下，得用 `n` 这种能放进 `short` 的"足够大"的值。

### 优化：降维成 $O(n^2)$

$n = 5000$ 时 $O(n^3) = 1.25 \times 10^{11}$，必超时。注意到题目**只问整条串**的答案，根本不需要二维状态：

$$dp[i] = \text{前 } i \text{ 个字符的最少回文段数}, \qquad dp[i] = \min_{1 \le j \le i,\; p[j][i]} \big(dp[j-1] + 1\big)$$

```cpp
const int N = 5010;
char s[N];
bool p[N][N];
int dp[N];

void solve(){
    int n; cin>>n>>s+1;
    for (int i=1;i<=n;i++) p[i][i]=1;
    for (int len=2; len<=n; len++)
        for (int i=1; i+len-1<=n; i++){
            int j = i+len-1;
            p[i][j] = (s[i]==s[j]) && (len==2 || p[i+1][j-1]);
        }
    dp[0] = 0;
    for (int i=1;i<=n;i++){
        dp[i] = 1e9;
        for (int j=i; j>=1; j--)
            if (p[j][i]) dp[i] = min(dp[i], dp[j-1]+1);
    }
    cout<<dp[n]<<endl;
}
```

时间 $O(n^2)$，能过。

> **这是区间 dp 的一个重要心法**：写完之后回头看，如果状态其实是「从某个固定端延伸出来的」，往往能降一个维度。

### ⚠️ 一个坑：别自己"化简"

网上流传过这个写法：

```cpp
f[i][j] = p[i][j] ? 1 : min(f[i+1][j], f[i][j-1]) + 1;   // 错的！
```

我用随机数据跑过，**它算出来比正解大**。反例 `"ABAADDABAD"`：正解 $4$（切成 `ABA|ADD|ABA|D`），这个式子算出 $6$。

原因是「两端都不配 → 各自单独成段」并不等于最优划分。区间 dp 的转移必须能**证明**，不能看着"像"就抄。

---

## 例2 [P1040 NOIP2005\] 合并石子](https://www.luogu.com.cn/problem/P1040)

### 题意

$n$ 堆石子排成一行，每次合并相邻的两堆，代价是两堆石子数之和。求把所有石子合并成 $1$ 堆的**最小代价**。$n \le 100$。

### 思路

「靠划分点」的标准模板题。

$ f[i][j] $ 表示把 $[i,j]$ 合并成一堆的最小代价。最后一次合并一定是在某个 $k$ 处，把已合并成两堆的 $[i,k]$ 和 $[k+1,j]$ 合起来：

$$f[i][j] = \min_{i \le k < j}\big(f[i][k] + f[k+1][j]\big) + \sum_{t=i}^{j} a_t$$

合并后的总石子数是固定的，用**前缀和**表示，省掉一层枚举。

### 代码

```cpp
const int N = 105;
int a[N], s[N], f[N][N];

void solve(){
    int n; cin>>n;
    for (int i=1;i<=n;i++) cin>>a[i];
    for (int i=1;i<=n;i++) s[i] = s[i-1] + a[i];
    for (int len=2; len<=n; len++)
        for (int i=1; i+len-1<=n; i++){
            int j = i+len-1;
            f[i][j] = 1e9;
            for (int k=i; k<j; k++)
                f[i][j] = min(f[i][j], f[i][k] + f[k+1][j]);
            f[i][j] += s[j] - s[i-1];
        }
    cout<<f[1][n]<<endl;
}
```

时间 $O(n^3)$。$n = 100$ 完全够，但**前缀和不能省**，否则内层再乘一个 $O(n)$ 就 TLE。

> 顺带一提：如果石子排成**一圈**，把数组复制一倍变成 $2n$，答案取 $f[1][n] \sim f[n+1][2n]$ 里长度恰好为 $n$ 的区间的最小值。这是后面「环形区间 dp」的通用套路。

---

## 例3 [括号区间匹配 - 牛客](https://www.nowcoder.com/practice/e391767d80d942d29e6095a935a5b96b)

### 题意

给一个只含 `( ) [ ] { }` 的字符串，每次可以匹配并删除一对**相邻且合法**的括号，求最多能匹配多少对。

### 思路

「靠两端点」的典型题。$ f[i][j] $ 表示区间 $[i,j]$ 内最多能匹配的括号对数。

对左端点 $i$ 分三种情况讨论：

1. $i$ 和 $j$ 配成一对 → $f[i+1][j-1] + 1$
2. $i$ 放弃不配，往后找 → $f[i+1][j]$
3. $j$ 放弃不配 → $f[i][j-1]$

$$f[i][j] = \max\Big(f[i+1][j],\; f[i][j-1],\; p(i,j)\cdot\big(f[i+1][j-1]+1\big)\Big)$$

其中 $p(i,j)$ 表示 $s_i$ 和 $s_j$ 能不能配对。

### 代码

```cpp
const int N = 1005;
int f[N][N];

void solve(){
    int n; string s; cin>>n>>s;
    memset(f, 0, sizeof f);
    for (int len=2; len<=n; len++)
        for (int i=0; i+len-1<n; i++){
            int j = i+len-1;
            f[i][j] = max(f[i+1][j], f[i][j-1]);
            bool ok = (s[i]=='('&&s[j]==')') || (s[i]=='['&&s[j]==']') || (s[i]=='{'&&s[j]=='}');
            if (ok) f[i][j] = max(f[i][j], f[i+1][j-1]+1);
        }
    cout<<f[0][n-1]<<endl;
}
```

> `f` 必须放**全局**。模板里有 `#define int long long`，一个写在 `solve()` 里的 `int f[1005][1005]` 在栈上就是 **8MB**，直接 `0xC00000FD` 栈溢出崩溃——这个错不编译出来根本看不出来。

注意 $len = 2$ 时 `f[i+1][j-1]` 即 `f[j][j-1]` 是空区间，数组初值为 $0$ 正好就是答案，**不用特判**。

> 这个 $O(n^2)$ 的状态设计也直接对应 LeetCode 的「最长有效括号」思路：区间 dp 天然能回答"区间内最多/最长"这类问题。

---

## 例4 [P2734 IOI 1996\] 游戏 A Game](https://www.luogu.com.cn/problem/P2734)

### 题意

$n$ 个石子排成一行，第 $i$ 个权值 $a_i$。两人轮流取，每次只能取当前最左或最右的一个，取到的权值加到自己手里。双方都采取最优策略，求**先手能得到的最大权值和**。

### 思路

这是区间 dp 里最经典的一类：**博弈**。两个人的目标都是「自己的总分最大」，那么：

$ f[i][j] $ 表示轮到**先手**时，先手在 $[i,j]$ 里能拿到的最大权值和。

先手取走 $a_i$ 之后，剩下 $[i+1,j]$ 的权值和是 $s_j - s_i$，而对手在新局面里能拿到的最大值是 $f[i+1][j]$，所以**我**能从剩下部分拿到的就是「剩下的总和」减去「对手的最大值」：

$$f[i][j] = \max\Big(a_i + (s_j - s_i) - f[i+1][j],\quad a_j + (s_{j-1} - s_{i-1}) - f[i][j-1]\Big)$$

> 这个式子看着绕，其实就是「我先拿一个，剩下的总量里扣掉对手能拿走的最多」。

### 代码（递推写法）

```cpp
const int N = 1005;
int a[N], s[N], f[N][N];

void solve(){
    int n; cin>>n;
    for (int i=1;i<=n;i++) cin>>a[i];
    for (int i=1;i<=n;i++) s[i] = s[i-1] + a[i];
    for (int len=1; len<=n; len++)
        for (int i=1; i+len-1<=n; i++){
            int j = i+len-1;
            f[i][j] = max(a[i] + (s[j]-s[i]) - f[i+1][j],
                          a[j] + (s[j-1]-s[i-1]) - f[i][j-1]);
        }
    cout<<f[1][n]<<endl;
}
```

$len=1$ 时取 `f[i+1][i]` / `f[i][i-1]`，都是空区间 $0$，不用特判。时间 $O(n^2)$。

### 代码（记忆化写法，更易读）

```cpp
const int N = 1005;
int a[N], s[N], f[N][N], vis[N][N];

int dfs(int i, int j){
    if (i > j) return 0;
    if (vis[i][j]) return f[i][j];
    vis[i][j] = 1;
    f[i][j] = max(a[i] + (s[j]-s[i]) - dfs(i+1, j),
                  a[j] + (s[j-1]-s[i-1]) - dfs(i, j-1));
    return f[i][j];
}

void solve(){
    int n; cin>>n;
    memset(vis, 0, sizeof vis);
    for (int i=1;i<=n;i++){ cin>>a[i]; s[i] = s[i-1] + a[i]; }
    cout<<dfs(1, n)<<endl;
}
```

> **记忆化的正确姿势**：全局数组要在每次 `solve()` 开头 `memset`，否则多组数据会串。注意 `vis` 和 `f` 都要清——`vis` 不清会直接返回上一组数据的残留值。下面例6我也会因为忘了这件事踩一次。

---

## 例5 [U522972 三角剖分](https://www.luogu.com.cn/problem/U522972)

### 题意

一个凸 $n$ 边形，顶点权值为 $w_1, w_2, \dots, w_n$。用对角线把多边形剖成 $n-2$ 个三角形，其中顶点为 $i, k, j$ 的三角形权值定义为 $w_i \cdot w_k \cdot w_j$。求所有三角形权值之和的**最小值**。

### 思路

多边形是「区间」的几何版。固定边 $(i, j)$，剖分时一定有一条对角线连到某个内部顶点 $k$，把问题拆成 $(i,k,j)$ 这个三角形加上两个子多边形：

$$f[i][j] = \min_{i < k < j}\big(f[i][k] + f[k][j] + w_i w_k w_j\big)$$

$f[i][j]$ 表示用 $i \dots j$ 这些顶点构成的子多边形做三角剖分的最小权值和。

**边界**：$f[i][i] = f[i][i+1] = 0$——一条边不构成三角形，代价为 $0$。

答案是 $f[1][n]$，时间 $O(n^3)$。

### 代码

```cpp
const int M = 105;
long long w[M];

void solve(){
    int n; cin>>n;
    for (int i=1;i<=n;i++) cin>>w[i];
    long long f[M][M] = {};
    for (int len=2; len<n; len++)              // j - i，至少要有 3 个顶点才构成三角形
        for (int i=1; i+len<=n; i++){
            int j = i+len;
            f[i][j] = 1e18;
            for (int k=i+1; k<j; k++)
                f[i][j] = min(f[i][j], f[i][k] + f[k][j] + 1LL*w[i]*w[k]*w[j]);
        }
    cout<<f[1][n]<<endl;
}
```

> **同构性**：三角剖分、矩阵链乘法、合并石子、字符串合并其实是**同一个模型**——都是在「固定的两端 $i, j$」和「一个中间点 $k$」上选切割。认得出这个模型，这四类题可以互相迁移。
>
> 注意 `len` 从 $2$ 开始（即 $j - i \ge 2$），从 $1$ 开始虽然不报错，但会让 $f[i][i+1]$ 被赋成一个巨大的无意义值。

---

## 例6 [P2532 SCOI2010\] 字符串](https://www.luogu.com.cn/problem/P2532)

### 题意

给一个字符串，每个字母有权值（`A=1, B=2, \dots, Z=26`）。每次可以把两个相邻的部分合并，**要求切分位置两侧的字符相同**；合并代价 = 左部分字母权和 $\times$ 右部分字母权和 $\times$ 合并后长度。求合并成一个串的最小代价。

### 思路

「靠划分点」+ **带条件的划分**。$ f[i][j] $ 表示把 $[i,j]$ 合并成一个串的最小代价，最后一次在 $k$ 处切，但只有 $s_k = s_{k+1}$ 时才允许：

$$f[i][j] = \min_{\substack{i \le k < j \\ s_k = s_{k+1}}} \Big(f[i][k] + f[k+1][j] + \sigma(i,k) \cdot \sigma(k+1,j) \cdot (j-i+1)\Big)$$

其中 $\sigma(l,r) = \sum_{t=l}^{r} v_t$ 用前缀和表示。

### 代码（递推）

```cpp
void solve(){
    int n; string t; cin>>n>>t;
    string s = " " + t;                       // 1-indexed，方便前缀和
    int v[130]={0}, sm[130]={0};
    for (int i=1;i<=n;i++){ v[i] = s[i]-'A'+1; sm[i] = sm[i-1] + v[i]; }
    long long f[130][130] = {};
    for (int len=2; len<=n; len++)
        for (int i=1; i+len-1<=n; i++){
            int j = i+len-1; f[i][j] = 1e18;
            for (int k=i; k<j; k++)
                if (s[k]==s[k+1]){
                    long long L = sm[k]-sm[i-1], R = sm[j]-sm[k];
                    f[i][j] = min(f[i][j], f[i][k] + f[k+1][j] + L*R*(j-i+1));
                }
        }
    cout<<f[1][n]<<endl;
}
```

### 代码（记忆化）

```cpp
const int K = 130;
string s;
int v[K], sm[K];
long long f[K][K];
bool vis[K][K];

long long dfs(int i, int j){
    if (i >= j) return 0;                     // 一个字符已经"合并好"了
    if (vis[i][j]) return f[i][j];
    vis[i][j] = 1;
    long long best = 1e18;
    for (int k=i; k<j; k++)
        if (s[k]==s[k+1]){
            long long L = sm[k]-sm[i-1], R = sm[j]-sm[k];
            best = min(best, dfs(i,k) + dfs(k+1,j) + L*R*(j-i+1));
        }
    return f[i][j] = best;
}

void solve(){
    int n; string t; cin>>n>>t;
    memset(vis, 0, sizeof vis);
    s = " " + t;                              // 1-indexed
    for (int i=1;i<=n;i++){ v[i] = s[i]-'A'+1; sm[i] = sm[i-1] + v[i]; }
    cout<<dfs(1, n)<<endl;
}
```

> **注意无解状态**：如果某个 $[i,j]$ 找不到合法切分点，$f[i][j]$ 会保持初值 $1e18$。参与加法前要留意几个 $1e18$ 加起来会不会溢出 `long long`（本题量级下不会），稳妥的做法是把"无穷大"取在 $4\times10^{18}$ 以内，或者转移前显式判掉无解状态。

---

## 例7 [P2268 POI2011\] 石头游戏](https://www.luogu.com.cn/problem/P2268)

### 题意

$n$ 堆石子排成一行，甲乙轮流取，每次只能取最左或最右的一堆，甲先取。甲想让自己手里的石子总数**最少**，乙想让甲手里的石子总数**最多**。问甲最终的石子总数。

### 思路

乙让自己拿的少 $\Longleftrightarrow$ 让甲拿得多（总量固定），所以两个人的目标是一致的形式：**当前先手都想让自己拿到的总数最少**。于是：

$$f[i][j] = \min\Big(a_i + (s_j - s_i) - f[i+1][j],\quad a_j + (s_{j-1} - s_{i-1}) - f[i][j-1]\Big)$$

**和例4只差一个 $\max / \min$**——这就是「博弈类区间 dp」的通用模板。

```cpp
const int N = 1005;
int a[N], s[N], f[N][N];

void solve(){
    int n; cin>>n;
    for (int i=1;i<=n;i++) cin>>a[i];
    for (int i=1;i<=n;i++) s[i] = s[i-1] + a[i];
    for (int len=1; len<=n; len++)
        for (int i=1; i+len-1<=n; i++){
            int j = i+len-1;
            f[i][j] = min(a[i] + (s[j]-s[i]) - f[i+1][j],
                          a[j] + (s[j-1]-s[i-1]) - f[i][j-1]);
        }
    cout<<f[1][n]<<endl;
}
```

> **验证小技巧**：博弈题写出来之后，用 $n \le 8$ 的随机数据对拍一个「枚举所有取法」的暴力，五分钟就能确认转移没写反。$\max / \min$ 写反是最常见的错法，肉眼看不出来。

---

# 拓展与进阶

## 1. 环形区间dp

区间是「链」，环上没法直接定义 $[i,j]$。通用做法：**把序列复制一倍**，在 $[1, 2n]$ 上做区间 dp，答案在「长度恰好为 $n$」的区间里取最优。

- 石子合并的环形版（把例2的数组抄一遍，答案 $\min f[i][i+n-1]$）
- [P3368 POI2014\] CIRC-循环](https://www.luogu.com.cn/problem/P3368)

> 复制一倍的前提是：环上的操作不会绕圈超过一圈。如果操作会绕多圈，就得改成「固定一个断点」的做法。

## 2. 树/路径上的区间dp

区间 dp 的「区间」不一定是数组下标，也可以是**树上的一条路径**。

[P3294 SCOI2016\] 萌萌鸡](https://www.luogu.com.cn/problem/P3294)：给一棵树，点有点权、边有边权，多次询问——取一条恰好 $k$ 个点的简单路径，最大化「点权之和 − 边权之和」。

做法：**枚举路径的一个端点 $u$ 作为固定起点**，从 $u$ 做一遍 dfs，记

$$dp[v][k] = \text{从 } u \text{ 出发经过 } v \text{ 、共取 } k \text{ 个点的路径上的最大值}$$

转移时换到儿子要减去父子边的权值。由于 $k$ 较小，把所有起点的贡献加总，总复杂度可以做到 $O(nk)$。

> 这类题的特征：**区间有一个"起点"参数**，所以状态其实是三维的 $dp[u][v][k]$，靠「枚举起点 + 每个起点跑一次」把维度显性化。

## 3. 记忆化搜索是区间dp的另一种写法

例4、例6都给了两套代码。经验法则：

| 情况 | 推荐写法 |
| --- | --- |
| 状态转移无分支、要求速度快 | 递推 |
| 博弈 / 有多层条件剪枝 / 只需一个答案 | 记忆化 |
| 状态需要挂在树上、路径上 | 记忆化 |

## 4. 区间dp之外：发现规律

有些题写出来是标准的 $O(n^2)$ 区间 dp，但数据规模逼你把它做掉。

- [P5906 NOI2023\] 放鸽子](https://www.luogu.com.cn/problem/P5906)：转移式是干净的区间 dp，但 $n$ 很大，必须观察出答案的**组合结构**才能压到线性/线性对数。
- [P5668 NOIP2020\] 制造赛特斯](https://www.luogu.com.cn/problem/P5668)：NOIP 级区间 dp，状态设计本身就有讲究。

这类题的思路都是：**先把区间 dp 写出来，再盯着转移式问"能不能消掉 $k$"**。

## 5. 补充题单

按难度/类型挑：

| 题目 | 类型 |
| --- | --- |
| [P2824 石块的放置](https://www.luogu.com.cn/problem/P2824) | 划分点 + 边界特判 |
| [P4170 CQOI2007\] 涂色](https://www.luogu.com.cn/problem/P4170) | 树上染色计数，可以和例7的博弈对照着看 |
| [P3294 SCOI2016\] 萌萌鸡](https://www.luogu.com.cn/problem/P3294) | 路径上的区间 dp |
| [P5906 NOI2023\] 放鸽子](https://www.luogu.com.cn/problem/P5906) | 区间 dp 优化 |
| [P5668 NOIP2020\] 制造赛特斯](https://www.luogu.com.cn/problem/P5668) | NOI/NOIP 级区间 dp |

> 题面的具体数据范围以洛谷原题为准，我这里只标注了题型。

---

# 小结

## 复杂度一览

| 例题 | 状态数 | 单状态转移 | 总复杂度 |
| --- | --- | --- | --- |
| 回文字串（降维后） | $O(n^2)$ | $O(1)$ | $O(n^2)$ |
| 合并石子 | $O(n^2)$ | $O(n)$ | $O(n^3)$ |
| 括号匹配 | $O(n^2)$ | $O(1)$ | $O(n^2)$ |
| 游戏 A Game | $O(n^2)$ | $O(1)$ | $O(n^2)$ |
| 三角剖分 | $O(n^2)$ | $O(n)$ | $O(n^3)$ |
| 字符串合并 | $O(n^2)$ | $O(n)$ | $O(n^3)$ |
| 石头游戏 | $O(n^2)$ | $O(1)$ | $O(n^2)$ |

**规律**：状态数几乎都是 $O(n^2)$，能不能过题全看转移能不能做到 $O(1)$。

## 易错点清单

1. **枚举顺序**：必须先算短区间，所以 `len` 是外层循环。顺序反了整个题全错。
2. **空区间约定**：$f[i+1][i] = 0$、$f[i][i+1] = 0$ 这类"越界即 $0$"要依赖数组初始化，靠运气不如靠显式约定。
3. **$\max / \min$ 写反**：博弈题最常见的错，对拍能查出来。
4. **前缀和别省**：合并类问题的代价用前缀和表示，能省掉整整一层循环。
5. **别抄没证明的"简化式"**：像例1里那个 `min(f[i+1][j], f[i][j-1])+1`，看着像对，实测是错的。
6. **数值范围**：三角剖分、字符串合并里有乘法，容易超 `int`，直接上 `long long`。
7. **全局数组要清**：记忆化版多次 `solve()` 必须重置 `vis`。
8. **大数组别放栈上**：`dp[1005][1005]` 这种一律写全局。模板里有 `#define int long long`，同样的代码在栈上就是 8MB，一跑就崩。
9. **`short` 装不下 `1e9`**：为省内存把 `f` 定义成 `short` 时，初值要用 `n` 这种装得下的"足够大"，`min` 的两个参数也要类型对齐。
10. **降维意识**：写完二维版本先问一句「真的需要两个下标吗？」，很多时候能省一个 $n$。

## 一句话总结

> 区间 dp = **$f[i][j]$ 表示区间最优解** + **按区间长度从小到大枚举** + **两端点或划分点二选一作为转移来源**。

状态、顺序、转移来源——这三样记住了，剩下的都是套模板。
