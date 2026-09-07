---
title: ABC_472-E题讲解
tags:
  - 算法
  - 题解
categories:
  - 题解
cover: images/archive-hero.jpg
abbrlink: 4a299758
date: 2026-08-23 21:50:56
description:
---

# [E - Odd Cycle](https://atcoder.jp/contests/abc472/tasks/abc472_e)

题目要求：在**连通无向图**中找一个**奇环**（顶点数为奇数）。

**关键定理**：

> 无向图存在奇环 ⇔ 该图不是二分图（不能二染色）。

所以解法分为两步：

1. **二分图染色**（BFS）——尝试给每个顶点标上 0/1 两种颜色，使每条边两端颜色不同。
2. 如果染色过程出现冲突（一条边两端颜色相同），说明不是二分图，一定存在奇环。**利用这条冲突边和 BFS 树构造出具体的奇环**。

怎么构造呢

假设冲突边为 `(u, v)`，且 `color[u] == color[v]`。

我们要利用 **BFS 树** 和这条非树边（冲突边）构造出一个环。
环的路线：从 `u` 向上走到 **LCA（最近公共祖先）**，再向下走到 `v`，最后通过冲突边 `v — u` 闭合。

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
void solve(){    
    //初始化
    int n,m;
    cin>>n>>m;
    vector<int> edge[n+1];
    for (int i=0;i<m;i++){
        int u,v;
        cin>>u>>v;
        edge[u].push_back(v);
        edge[v].push_back(u);
    }
    vector<int> col(n+1,-1),p(n+1),dis(n+1);
    // col 颜色：-1=未染，0/1=两种颜色
    // p BFS树中的父节点（根节点的父节点设为0）
    // dis BFS树中的深度（根节点深度为0）
    bool found=0;
    vector<int> cycle;
    //BFS 染色过程
    queue<int> q;
    col[1]=0;
    q.push(1);
    while (!q.empty() && !found){
        int u=q.front();
        q.pop();
        for (int v:edge[u]){
            if (col[v]==-1){
                col[v]=col[u]^1;
                dis[v]=dis[u]+1;
                p[v]=u;
                q.push(v);
            }else if (col[u]==col[v]){
                found=1;
                // 构造环
                //1.找lca
                int a=u,b=v;
                while (dis[a]>dis[b]) a=p[a];
                while (dis[b]>dis[a]) b=p[b];
                while (a!=b){
                    a=p[a];
                    b=p[b];
                }
                int lca=a;
                //记录路径
                vector<int> path1;
                int cur=u;
                while (cur!=lca){
                    path1.push_back(cur);
                    cur=p[cur];
                }
                path1.push_back(lca);
                cur=v;
                vector<int> path2;
                while (cur!=lca){
                    path2.push_back(cur);
                    cur=p[cur];
                }
                cycle=path1;
                //注意把path2翻转之后记录的路径才是完整的环
                for (int i=path2.size()-1;i>=0;i--) cycle.push_back(path2[i]);
                break;
            }
        }
    }
    if (!found){
        cout<<-1<<endl;
    }else{
        cout<<cycle.size()<<endl;
        for (int v:cycle){
            cout<<v<<' ';
        }
        cout<<endl;
    }
}
signed main(){
    IOS;
    int  T=1;
    cin>>T;
    while (T--) solve();
    return 0;
}
```

