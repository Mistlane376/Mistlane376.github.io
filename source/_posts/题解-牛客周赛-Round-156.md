---
title: 题解-牛客周赛-Round-156
date: 2026-08-14 20:55:43
tags:
  - 算法
  - ACM
  - 题解
categories:
  - 题解
description: 赛后题解书写，以便梳理
cover: /images/selection4.jpg
abbrlink: Nowcoder Weekly Contest - Round 156
---

AB略(●'◡'●)
值得回顾的题EF

# [C-小红的权值_牛客周赛 Round 156](https://ac.nowcoder.com/acm/contest/138917/C)

## 题意

长度为n的数组a，给一个数x，定义a的权值为**$\sum_{i=1}^{n} \lvert a_i-x \rvert$**

q次询问，第i次询问给出一个非负整数$k_i$

每次操作:**任选一个元素更改为任意整数**，求最少多少次操作使a的权值不大于$k_i$

## 思路

令t=未操作前a的权值。

注意到，若$k_i\geq t$，输出0即可；

若$k_i\le t$，观察$\sum_{i=1}^{n} \lvert a_i-x \rvert$，每次操作可以将一个元素对t的贡献改为0。

要想操作最少，应该按照对t的贡献从大到小依次改；

所以我们计算单个的贡献，从大到小排序，求前缀和，每次询问二分查找即可。

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
    int n,q,x;
    cin>>n>>q>>x;
    int t=0;
    vector<int> a(n+1);
    for (int i=1;i<=n;i++){
        cin>>a[i];
        t+=abs(a[i]-x);
        a[i]=abs(a[i]-x);
    }
    sort(a.begin()+1,a.end(),greater());
    for (int i=1;i<=n;i++){
        a[i]+=a[i-1];
    }
    while (q--){
        int k;
        cin>>k;
        if (t<=k){
            cout<<0<<endl;
            continue;
        }
        int ans=lower_bound(a.begin(),a.end(),t-k)-a.begin();
        cout<<ans<<endl;
        
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



---

# [D-小红的01矩阵_牛客周赛 Round 156](https://ac.nowcoder.com/acm/contest/138917/D)

## 题意

3行n列的矩阵，其中仅包括1，0，？；

矩阵合法：当且仅当不包含完全相当的两列，

将？改为0或1后，求一共有多少种合法的矩阵。

## 思路

01串，一列相当于三位二进制，仅有8种可能，当列数大于8时，答案为0。

当小于8时暴力搜索即可，我们一列一列的枚举所有可能的情况，若在之前出现过则跳过，当找完最后一列时，说明找到了一个合法的矩阵返回1。

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
vector<string> s(3);
int n;
int work(int i,set<int> st){
    if (i>=n){
        return 1;
    }
    int mex=1;
    set<int> cur;
    cur.insert(0);
    for (int j=0;j<3;j++){
        if (s[j][i]!='0'){
            set<int> t;
            for (int v:cur){
                t.insert(v+mex);
            }
            if (s[j][i]=='1'){
                cur=t;
            }else{
                for (int v:t){
                    cur.insert(v);
                }
            }
        }
        mex<<=1;
    }
    int res=0;
    for (int v:cur){
        if (st.count(v)) continue;
        st.insert(v);
        res+=work(i+1,st);
        st.erase(v);
    }
    return res;
}
void solve(){    
    cin>>n;
    if (n>8){
        cout<<0<<endl;
        return ;
    }
    for (int i=0;i<3;i++){
        cin>>s[i];
    }
    set<int> st;
    int ans=work(0,st);
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



---

# [E-小红的树染色_牛客周赛 Round 156](https://ac.nowcoder.com/acm/contest/138917/E)

## 题意

n个节点的树，其中有节点染红（$个数\ge2$）。

计算对于 i $\in$ [1,n]，求在初始染色基础上将i号节点染红，所有红色节点之间的距离最大是多少。

## 思路

本题基于树的一个性质求解:

> **对于树上的任意一个点集 S（例如本题中的红点集合），设其直径的两个端点为 a 和 b。那么，对于树上的任意节点 u（无论 u 是否属于 S），u 到点集 S 中所有点的最大距离，一定等于 u 到 a 或 u 到 b 的距离中的较大者。**

那么若一个点本是红色，那么最大距离就是直径的长度。

若本不是红色，那么距离就是max(直径长度,max(dist(i,a),dist(i,b)));

如何快速求的树上两点之间的距离，（现学的）用LCA（套的模板）或数链剖分（不会/_ \）

## 代码

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005; // 节点数
const int LOG = 20;      // 通常取 lg(MAXN) + 1, 对于5e5取20, 1e6取21

vector<int> edge[MAXN];
int depth[MAXN];          // 节点深度
int up[MAXN][LOG];        // up[u][i]: u向上走2^i步到达的祖先
// 1. DFS预处理深度和倍增表 (递归版，注意栈溢出风险，可用BFS)
void dfs(int u, int fa) {
    depth[u] = depth[fa] + 1;
    up[u][0] = fa; // 走2^0步即父节点
    
    for (int i = 1; i < LOG; i++) {
        // 核心转移：2^i = 2^(i-1) + 2^(i-1)
        up[u][i] = up[ up[u][i-1] ][i-1];
    }
    
    for (int v : edge[u]) {
        if (v == fa) continue;
        dfs(v, u);
    }
}

// 2. 将节点u向上跳diff步 (二进制拆分)
int jump(int u, int diff) {
    for (int i = 0; diff; i++, diff >>= 1) {
        if (diff & 1) u = up[u][i];
    }
    return u;
}

// 3. 查询LCA
int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    
    // Step 1: 把u提到和v同一深度
    int diff = depth[u] - depth[v];
    for (int i = 0; i < LOG; i++) {
        if (diff & (1 << i)) u = up[u][i];
    }
    
    if (u == v) return u;
    
    // Step 2: 从高位往低位尝试，如果祖先不同就跳上去
    for (int i = LOG - 1; i >= 0; i--) {
        if (up[u][i] != up[v][i]) {
            u = up[u][i];
            v = up[v][i];
        }
    }
    return up[u][0]; // 返回父节点
}

// 4. 求树上两点距离 (需要预处理根到节点距离dist)
int getDist(int u, int v) {
    int anc = lca(u, v);
    return depth[u] + depth[v] - 2 * depth[anc];
}
signed main(){
    int n;
    cin>>n;
    string s;
    cin>>s;
    s=' '+s;
    for (int i=1;i<n;i++){
        int u,v;cin>>u>>v;
        edge[u].push_back(v);
        edge[v].push_back(u);
    }
    dfs(1,0);
    vector<int> red;
    for (int i=1;i<=n;i++){
        if (s[i]=='1') {
           red.push_back(i);
        }
    }
    int t=red[0];
    int mxd=0;
    int A=red[0],B=0;
    for (int v:red){
        int dis=getDist(t,v);
        if (dis>mxd){
            mxd=dis;
            A=v;
        }
    }
    mxd=0;
    for (int v:red){
        int dis=getDist(A,v);
        if (dis>mxd){
            mxd=dis;
            B=v;
        }
    }
    for (int i=1;i<=n;i++){
        if (s[i]=='1'){
            cout<<mxd<<endl;
            continue;
        }
        cout<<max(mxd,max(getDist(i,A),getDist(i,B)))<<endl;;
    }
    return 0;
}
```



---

# [F-小红的排列计数_牛客周赛 Round 156](https://ac.nowcoder.com/acm/contest/138917/F)

## 题意

给定整数 n,k(n$\le$1000)，请求出满足以下要求的长为 n 的排列$p_1, p_2,\dots, p_n$ 的数量：

- 恰好有 k 个下标 $\left(2 \leq i \leq n- 1 \right)$满足 $p_i < p_{i - 1}$ 且 $p_i < p_{i + 1}$。

## 思路

该条件就是一个数组的坑

按照插入的想法，每次插入从大到小的插入数字，每次插入可能会有产生坑或不会；

插入有以下规律

- 若插在两边不会产生坑 数量*2
- 若在坑两边不会产生坑 数量`*`(`2*`坑的数量)
- 其他会产生坑 数量*（原来的长度）-1-`2*`坑的数量）

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
    int n,k; cin>>n>>k;
    vector<vector<int> > dp(n+1,vector<int> (k+1));
    dp[n][0]=1;
    for (int i=n-1;i>=1;i--){
        for (int j=0;j<=k;j++){
            dp[i][j]+=dp[i+1][j]*(2+2*j);
            dp[i][j]%=mod2;
            if (j>0 && n-i+1-2*j>0) dp[i][j]+=dp[i+1][j-1]*(n-i+1-2*j);
            dp[i][j]%=mod2;
        }
    }
    cout<<dp[1][k]<<endl;
}
signed main(){
    IOS;
    int  T=1;
    //cin>>T;
    while (T--) solve();
    return 0;
}
```



---
