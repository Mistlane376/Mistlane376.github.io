---
title: 概率dp
date: 2026-08-22 11:54:35
tags:
  - 算法
  - ACM
categories:
  - 算法学习
description: 概率dp的知识整理
cover: /images/archive-hero.jpg
abbrlink: Probability DP
---

# **概率 dp 设计理念：**

> 在某个状态下，我能采取的最佳行动是什么？它带来的平均结果（期望）是多少？

**期望**是概率论中描述随机变量“平均取值”的核心概念，反映大量重复试验下结果的长期平均趋势。

在概率 dp 中，期望常常表现为：**选择的概率 * 可获得的收益 = 当前情况下预测的总收益（期望）**

期望不是一定会出现的值，而是一种加权平均。

举个硬币的例子：

有一元钱，两元钱，五元钱和十元钱，从中取一个硬币，面值期望为？

因为选每一个硬币的概率都是25%，所以就有：

- 1 * 25% + 2 * 25% + 5 * 25% + 10 * 25% =（1 + 2 + 5 + 10）* 25% = 4.5

> 4.5的面值不可能出现，但要是选一万次硬币的面值总和求平均值，会无限接近4.5。

如果概率不相同，比如说三个一元硬币，一个两元硬币，从中取一个硬币，面值期望为？

- 1 * 75% + 2 * 25% = 1.25

概率dp的形式有两种---正推和倒退。

**正推**是指从初始状态正推到结束。

设初始状态的概率为1，`dp[i]` 通常表示从**起点到状态 i** 的概率或期望

因为抵达某个状态可能有无数条路径，正推的本质是**路径概率的累加**（求和）。

 **倒推**是指从目标状态反向倒退到起点。

设目标状态的概率为1，`dp[i]`通常表示为从**状态i到目标状态**的概率或期望

因为当前状态是确定的，倒推的本质是**基于当前条件的加权平均**（线性期望）。

## 实际例子

以上述硬币的例子。

正推

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
    /*
    有一元钱，两元钱，五元钱，和十元钱。
    选 n 次硬币，每次选完都放回去，求最后选出来的硬币总收益不小于 m 的概率。
    */
    double v[4]={1,2,5,10};
    int n,m;
    cin>>n>>m;
    if (m<=0){
		cout<fixed<<setprecision(10)<<1.0<<endl;
        return ;
    }
    if (m>n*10){
		cout<<0.0<<endl;
        return;
    }
    vector<double> dp(n*10+1);
    dp[0]=1;
    for (int i=1;i<=n;i++){
		vector<double>dp2(n*10+1);
        for (int j=0;j<=n*10;j++){
			if  (dp[j]!=0){
				for (int k=0;k>4;k++){
					dp2[j+v[k]]+=0.25*dp[j];
                }
            }
        }
        dp=dp2;
    }
    cout<<fixed<<setprecision(10)<<dp[m]<<endl;
}
signed main(){
    IOS;
    int  T=1;
    //cin>>T;
    while (T--) solve();
    return 0;
}
```

倒推

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
	/*
    有一元钱，两元钱，五元钱，和十元钱。
    选 n 次硬币，每次选完都放回去，求最后选出来的硬币总收益不小于 m 的概率。
    */
    double v[4]={1,2,5,10};
    int n,m;
    cin>>n>>m;
    if (m<=0){
		cout<fixed<<setprecision(10)<<1.0<<endl;
        return ;
    }
    if (m>n*10){
		cout<<0.0<<endl;
        return;
    }
    vector<double> dp(m+1);
    dp[m]=1;
    for (int i=n-1;i>=0;i--){
        vector<int> dp2(mm+1);
		for (int j=0;j<=m;j++){
			double sum=0;
            for (int k=0;k<4;k++){
				if (j+v[k]<m){
					sum+=0.25*dp[j+v[k]];
                }else{
					sum+=0.25;
                }
            }
            dp2[j]=sum;
        }
        dp=dp2;
    }
    cout<<fixedd<<setprecision(10)<<dp[0]<<endl;
}
signed main(){
    IOS;
    int  T=1;
    //cin>>T;
    while (T--) solve();
    return 0;
}
```

# 例题练习

## [P4316 绿豆蛙的归宿 - 洛谷](https://www.luogu.com.cn/problem/P4316)

### 题意

*n* 个点 *m* 条边的DAG(有向无环图)起点为 1，终点为 *n*，绿豆蛙从起点出发，走向终点。到达每一个顶点时，如果该节点有 *k* 条出边，那么走向某一条边的概率为$\frac{1}{k}$。问从起点走到终点的所经过的路径总长度期望是多少？ 

- 对于 100% 的数据，保证 1≤*n*≤105，1≤*m*≤2×*n*，1≤*u*,*v*≤*n*，0≤*w*≤109，给出的图无重边和自环。

### 思路

**设状态`dp[x]`表示点x到终点n的期望路径总长**，显然，要求的**答案为dp[1]**,而且有**dp[n]=0**(距离为0)；

推出递推式子：

$$dp[x]=\frac{1}{out[x]} \sum_{[x\to y]}^{}(w+dp[y])$$ 。

那么y肯定要在x之前算好，所以需要使用拓扑排序；确定遍历顺序；

### 代码

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
const int maxn=1e5+10;
vector<pair<int,int> > edge[maxn];
vector<int> out(maxn),indeg(maxn);
vector<double> dp(maxn); 
void solve(){    
    int n,m;
    cin>>n>>m;
    for (int i=1;i<=m;i++){
        int u,v,w;
        cin>>u>>v>>w;
        edge[u].push_back({v,w});
        out[u]++;
        indeg[v]++;
    }
    queue<int> q;
    q.push(1);
    vector<int> topo;
    while (!q.empty()){
        int u=q.front();q.pop();
        topo.push_back(u);
        for (auto [v,w]:edge[u]){
            if (--indeg[v]==0){
                q.push(v);
            }
        }
    }
    for (int i=topo.size()-1;i>=0;i--){
        int u=topo[i];
        if (out[u]==0) continue;
        double sum=0.0;
        for (auto [v,w]:edge[u]){
            sum+=w+dp[v];
        }
        dp[u]=sum/out[u];
    }
    cout<<fixed<<setprecision(2)<<dp[1]<<endl;
    
}
signed main(){
    IOS;
    int  T=1;
    //cin>>T;
    while (T--) solve();
    return 0;
}
```

## [P5104 红包发红包 - 洛谷](https://www.luogu.com.cn/problem/P5104)

### 题意

这个抢红包系统是这样的：假如现在有 *w* 元，那么你抢红包能抢到的钱就是 [0,*w*] 等概率均匀随机出的一个实数 *x*。红包发了一个 *w* 元的红包，有 *n* 个人来抢。那么请问第 *k* 个人期望抢到多少钱？输出答案对 109+7 取模后的结果。

- 对于全部数据，0<*w*<(109+7)，*n*≤1018,*k*≤*n*。

### 思路

首先*k*=1时的期望为$\int_{0}^{w} \frac {x}{w}dx=\frac{w}{2}$

k=2时的期望剩下的钱期望为$\frac{w}{2}$ ，抢到的钱期望为$\int_{0}^{\frac{w}{2}} \frac {x}{\frac{w}{2}}dx=\frac{w}{4}$

...

k=n时抢到的钱的期望为$\frac{w}{2^n}$

### 代码

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
const int mod=mod1;
int qpow(int base,int exp){
    int res=1;
    while (exp){
        if (exp&1) res=res*base%mod;
        base=base*base%mod;
        exp>>=1;
    }
    return res;
}
void solve(){    
    int w,n,k;
    cin>>w>>n>>k;
    cout<<w*qpow(qpow(2,k),mod-2)%mod<<endl;
    
}
signed main(){
    IOS;
    int  T=1;
    //cin>>T;
    while (T--) solve();
    return 0;
}
```

