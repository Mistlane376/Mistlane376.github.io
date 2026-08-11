---
title: 题解 | 牛客周赛 Round 155
date: 2026-08-04 10:04:25
tags:
  - 算法
  - ACM
  - 题解
categories:
  - 题解
description: 赛后题解书写，以便梳理
cover: /images/selection3.jpg
abbrlink: Nowcoder Weekly Contest - Round 155
---
# [A-小月的奇偶灯控_牛客周赛 Round 155](https://ac.nowcoder.com/acm/contest/138240/A)

## 题意

小月为展厅安装了三个彼此独立的开关，它们的开关状态用三个整数 x~1~,x~2~,x~3~ 表示，第 iii 个开关的状态为 x~i~，000 表示关闭，111 表示开启。
控制器会统计开启开关的数量。若开启开关的数量为奇数，指示灯点亮；否则指示灯熄灭。请输出指示灯的状态。

## 思路

显然我们只需要统计1的数量

## 代码

```cpp
#include <bits/stdc++.h>
using namespace std;
#define IOS ios::sync_with_stdio(false); cin.tie(0); cout.tie(0)
#define endl "\n"
#define int long long
#define ld long double 
const int mod1 = 1e9 + 7;
const int mod2 = 998244353;
const double PI = acos(-1.0),eps=1e-12L;
const long long  inf=1e18+10;
void solve(){    
    int ans=0;
    for (int i=0;i<3;i++){
        int x;
        cin>>x;
        ans+=x;
    }
    if (ans%2) cout<<"ON"<<endl;
    else cout<<"OFF"<<endl;
}
signed main(){
    IOS;
    int  T=1;
    //cin>>T;
    while (T--) solve();
    return 0;
}
```

# [B-小月的立方体_牛客周赛 Round 155](https://ac.nowcoder.com/acm/contest/138240/B)

## 题意

给定一个边长为 a的格点立方体。相邻格点之间的距离为 1。格点的坐标表示为 (x,y,z)0≤x,y,z≤a），其中 x,y,z均为整数。每条棱上恰有 a+1个格点，坐标为 (x,y,z) 的格点上写有整数 vx,y,z。

请计算这个立方体的四条体对角线上的数字之和。若一个格点位于多条体对角线线上，则按所在体对角线线的条数重复计入。

## 思路

相当于一个由（a+1）*(a+1)个方格组成的立方体，我们需要观察体对角线的方格有什么特点；

想象分成n+1层，每个层由四个方格(如果交与同一个方格，也需要加4遍)，这四个方格的坐标规律也可以很好的总结出来,分别为：（i，i，i），（i,a+2-i,i），（i,i，a+2-i），（i,a+2-i,a+2-i）；



## 代码

```cpp
#include <bits/stdc++.h>
using namespace std;
#define IOS ios::sync_with_stdio(false); cin.tie(0); cout.tie(0)
#define endl "\n"
#define int long long
#define ld long double 
const int mod1 = 1e9 + 7;
const int mod2 = 998244353;
const double PI = acos(-1.0),eps=1e-12L;
const long long  inf=1e18+10;
void solve(){    
    //为了省一点点内存，所以就不事先存一个数组了
    int n;
    cin>>n;
    int ans=0;
    for (int i=1;i<=n+1;i++){
        for (int j=1;j<=n+1;j++){
            for (int k=1;k<=n+1;k++){
                int x;cin>>x;
                if ((j==i || j==n+2-i ) && (k==i ||k==n+2-i)) {
                    if ((j==i && j==n+2-i ) && (k==i && k==n+2-i))ans+=4*x; 
                    else ans+=x;
                }
            }
        }
    }
    cout<<ans<<endl;
}
signed main(){
    IOS;
    int  T=1;
    //cin>>T;
    while (T--) solve();
    return 0;
}
```

# [C-小月的密码锁_牛客周赛 Round 155](https://ac.nowcoder.com/acm/contest/138240/C)

## 题意

小月正在设置长为 n 的密码。密码中的每一位只会是 A、B、C、D、E 之一，且它们按 A→B→C→D→E→A的循环顺序排列。
初始密码为长度 n的字符串 s。密码的设置按如下顺序进行：

- 选择一个分界位置 c（0≤c≤n），前 c 位密码用前模块处理，后 n−c 位密码用后模块处理；
- 分别为前、后模块选择偏移量 p,q（0≤p,q≤4），对于前模块处理的字符沿循环方向移动 p 次，后模块处理的字符移动 q次。

经过上述流程后的密码变为 s，小月希望 s 与目标密码 t 尽可能相近。请你计算，在任选 c,p,q 的条件下，s 与 t最少有多少位不同。

## 思路

分成前后两段，所以我们可以维护前缀数组与后缀数组，记录这一段移动相同次数可以变成t字符串的最大字符数

ABCDEA的移动是一个循环，所以最大只会有5种情况（0，1，2，3，4），可以分别枚举前后的移动次数，并用前缀和维护来达到O(1)求解；

## 代码

```cpp
#include <bits/stdc++.h>
using namespace std;
#define IOS ios::sync_with_stdio(false); cin.tie(0); cout.tie(0)
#define endl "\n"
#define int long long
#define ld long double 
const int mod1 = 1e9 + 7;
const int mod2 = 998244353;
const double PI = acos(-1.0),eps=1e-12L;
const long long  inf=1e18+10;
void solve(){    
    int n;
    cin>>n;
    string s,t;
    cin>>s>>t;
    s=' '+s;
    t=' '+t;
    if (n==1){
        cout<<0<<endl;
        return;
    }
    vector<vector<int> > pre(n+1,vector<int> (5)),suf(n+2,vector<int> (5));
    for (int i=1;i<=n;i++){
        pre[i][(t[i]-s[i]+5)%5]++;
        for (int j=0;j<5;j++) pre[i][j]+=pre[i-1][j];
    }
    for (int i=n;i>=1;i--){
        suf[i][(t[i]-s[i]+5)%5]++;
        for (int j=0;j<5;j++) suf[i][j]+=suf[i+1][j];
    }
    int ans=0;
    for (int i=0;i<=n;i++){
        int l=0,r=0;
        for (int j=0;j<5;j++){
            l=max(l,pre[i][j]);
            r=max(r,suf[i+1][j]);
        }
        ans=max(ans,l+r);
    }
    cout<<n-ans<<endl;
}
signed main(){
    IOS;
    int  T=1;
    //cin>>T;
    while (T--) solve();
    return 0;
}
```

# [D-小月的电台_牛客周赛 Round 155](https://ac.nowcoder.com/acm/contest/138240/D)

## 题意



n个电台，m个频道，每个电台给出一个长度为m的01串，1表示支持该频道，0反之，若不同的电台共同支持一个频道，则表示他们可以通信，问通信的电台对数？

数据范围

n,m(1≦n≦2×105;1≦m≦11)



## 思路

注意到m只有11，那么所有电台的状态（可以播放那一种频道）只有2^m^ ，所以我们可以记录每一种状态的电台数，每种状态用对应的掩码表示。如果两个状态之间可以通信， 每个状态对应的掩码相与结果不为0，（出现了位运算，注意运算符的优先级，`!=`比`&`高）

2^11^ 等于2048，令N=2^m^ O(N^2^)可过，两次循环，注意处理重复的情况，

计算公式：

枚举所有状态

若是相同的状态： ans+=$\binom{cnt}{2}$

若是不同的状态：ans+= cnt~1~ $\times$ cnt~2~ 

## 代码

```cpp
#include <bits/stdc++.h>
using namespace std;
#define IOS ios::sync_with_stdio(false); cin.tie(0); cout.tie(0)
#define endl "\n"
#define int long long
#define ld long double 
const int mod1 = 1e9 + 7;
const int mod2 = 998244353;
const double PI = acos(-1.0),eps=1e-12L;
const long long  inf=1e18+10;
void solve(){    
    int n,m;
    cin>>n>>m;
    int N=(1<<m);
    vector<int> cnt(N);
    for (int i=1;i<=n;i++){
        string s;
        cin>>s;
        int mask=0;
        for (int j=0;j<m;j++){
            if (s[j]=='1') mask+=(1<<(m-1-j));
        }
        cnt[mask]++;
    }
    int ans=0;
    for (int i=0;i<N;i++){
        for (int j=i;j<N;j++){
            if ((i&j)!=0)
            if (i==j) ans+=cnt[i]*(cnt[i]-1)/2;
            else ans+=cnt[i]*cnt[j];
        }
    }
    cout<<ans<<endl;
}
signed main(){
    IOS;
    int  T=1;
    //cin>>T;
    while (T--) solve();
    return 0;
}
```

# [E-小月的折月门牌_牛客周赛 Round 155](https://ac.nowcoder.com/acm/contest/138240/E)

## 题意

有2^k^个门牌，第x个门牌号为：

- 前面的门牌数量cnt=x-1。
- cnt与它的一半异或（向下取整）mid=cnt $\oplus$ [cnt/2]    (可以视作格雷码**`g = n ^ (n >> 1)`**)
- mid写成k位的二进制，然后翻转得到的二进制数转十进制就是 门牌号码c~i~



q次询问，给出[l,r]区间，和h，z，问有多少个位置x，满足门牌号c~i~ 除以2^h^的余数等于z；

## 思路：

设 $c_i$ 从低位到高位的第 ![img](https://www.nowcoder.com/equation?tex=i&preview=true) 位为 $c_i$。由于门牌号是格雷码翻转得到的，有： $$c_i=g_{k-1-i}$$



而格雷码反解满足：$$b_{k-1}=z_0,b_{k-2}=z_0\oplus z_1,b_{k-3}=z_0\oplus z_1\oplus z_2$$

所以直接从c的地位向高位扫一遍，维护前缀异或，就能得到x-1的高h位pref。满足条件的位置是：

$$pref\cdot 2^{k-h}+1,(pref+1)\cdot 2^{k-h} $$

令b=x-1，其格雷码为g=b^(b>>1)。翻转后取低h为，等价于取g的高h位，因此：

$$c_x mod 2^h=z \Longleftrightarrow g的高h位=rev_h(z)$$

将该高位格雷码逆变换,得到b的高h位为u，令$len=2^{k-h}$,满足条件的所有位置恰为：

$$x\in [u\cdot len+1,(u+1)\cdot len]$$.

与查询区间相交即可。

**为什么固定高位后，x就一定是一段连续区间？**

现在我们知道了原数 n=x−1 的高 h位等于 `pref`。
假设总长度 k=5，已知高 h=2 位是二进制的 `10`（也就是十进制 2）。

那么原数 n 的二进制长什么样？
必须是：`10` + `???`（后面低 3 位随便取）。
从小到大列举：

- `10000` = 16
- `10001` = 17
- `10010` = 18
- `10011` = 19

你看，**它是不是连续的一段整数？** 从 16 到 19，一个不漏。
这段区间的长度，就是后面低 k−h*k*−*h* 位能表示的所有数字个数，即 2k−h2*k*−*h*。

因为 x=n+1*x*=*n*+1，所以门牌位置 x*x* 就是：

- 左端点：16+1=17
- 右端点：19+1=20
- 写成公式就是：[$$pref\times 2^{k-h}+1,(pref+1) \times 2^{k-h} $$]



## 代码



```cpp
#include <bits/stdc++.h>
using namespace std;
#define IOS ios::sync_with_stdio(false); cin.tie(0); cout.tie(0)
#define endl "\n"
#define int long long
#define ld long double 
const int mod1 = 1e9 + 7;
const int mod2 = 998244353;
const double PI = acos(-1.0),eps=1e-12L;
const long long  inf=1e18+10;
void solve(){    
	int k,q;
    cin>>k>>q;
    while (q--){
		int l,r,h,z;
        cin>>l>>r>>h>>z;
        int pref=0,cur=0;//pref记录格雷码反解
        for (int i=0;i<h;i++){
			cur^=(z>>i)&1;
            pref=(pref<<1)|cur;
        }
        int len=1ll<<(k-h),L=pref*len+1,R=(pref+1)*len;
        //取交集
        cout<<max(0LL,min(r,R)-max(l,L)+1)<<endl;
    }
}
signed main(){
    IOS;
    int  T=1;
    //cin>>T;
    while (T--) solve();
    return 0;
}
```

