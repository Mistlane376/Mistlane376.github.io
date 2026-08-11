---
title: abc468CDEFG
date: 2026-07-27 16:30:50
tags:
  - 算法
  - 题解
  - ACM
categories: 题解
description: 赛后题解书写，以便梳理
cover: /images/selection3.jpg
abbrlink: abc468cdefg
---

# [C - Between P and Q](https://atcoder.jp/contests/abc468/tasks/abc468_c)

## 题意简述

给定两个长度为N的排列P和Q，找到满足字典序大于P小于Q的长度为N的排列的个数

## 约束条件

- 1≤N≤10
- P和 Q 是 (1,2,…,N) 的排列。
- 所有输入值均为整数。

### 思路

注意到N很小，所以可以枚举所以排列，挨个判断大小；

所以需要写个函数判断大小，根据字典序的定义

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
bool judge(vector<int> &a,vector<int> &b){
    int n=a.size();
    for (int i=0;i<n;i++){
        if (a[i]!=b[i]){
            return a[i]>b[i];
        }
    }
    return 0;
}
void solve(){    
    int n;
    cin>>n;
    vector<int> p(n),q(n);
    for (int i=0;i<n;i++) cin>>p[i];
    for (int i=0;i<n;i++) cin>>q[i];
    vector<int> t(n);    
    for (int i=0;i<n;i++) t[i]=i+1; 
    int ans=0;
    do{
        if (judge(t,p) && judge(q,t)) ans++;
    }while(next_permutation(t.begin(),t.end()));
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

# [D - Pre-Palindrome](https://atcoder.jp/contests/abc468/tasks/abc468_d)

## 题意简述

一个只包含小写英文字母的字符串，如果满足下面这个条件，就被称作**好字符串**：

- 最多改写一个字符后，它能变成一个回文串。

给定一个问有多少个子串是好字符串。

## 约束条件

- S 的长度在 11 到 104104 之间，且只包含小写英文字母。

### 思路

一般问回文串有很多情况可以按照长度分成偶数长度和技术长度；

我们也可以按照这个来分类
注意到：一个字符串向两边拓展，只有不符合的大于2，那么之后的肯定不复和；

奇数：长度为1的肯定符合，本身就是回文串，本身不符合的为0，然后向外拓展

偶数：长度为2也肯定符合，本身不符合的<=1，预计算出，然后重复奇数的操作

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
void solve(){    
	string s;
	cin>>s;
	int n=s.size();
	int ans=0;
	//奇数
	for (int i=0;i<n;i++){
		ans++;
		int cnt=0;
		int l=i-1,r=i+1;
		while (l>=0 && r<n){
			if (s[l]!=s[r]) cnt++;
			if (cnt==2) break;
			ans++;
			l--;
			r++;
		}
	}
	//偶数
	for (int i=0;i<n-1;i++){
		ans++;
		int cnt=(int)(s[i]!=s[i+1]);
		int l=i-1,r=i+2;
		while (l>=0 && r<n){
			if (s[l]!=s[r]) cnt++;
			if (cnt==2) break;
			ans++;
			l--;
			r++;
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

# [E - Sum of Average](https://atcoder.jp/contests/abc468/tasks/abc468_e)

## 题目描述

给你一个正整数 N，还有一个长度为 N 的整数序列 A=(A1,A2,…,AN)。

定义 f(l,r) 为区间 A~l~,A~l+1~,…,A~r~的算术平均值。

求 $\sum_{1 \leq l \leq r \leq N} f(l, r)$，结果对 998244353998244353 取模。

### 约束条件

- 1≤N≤5×10^5^
- 0≤Ai<998244353
- 所有输入均为整数。

### 思路

对于这中的求和公式我们可以尝试拆分化简

对于单独的A~i~ 他对答案的贡献可以写成A~i~ 乘以几个分数之和；

那么这个分数之和我们可以通过打表得出规律

|      | 1/1  | 1/2  | 1/3  | 1/4  | 1/5  | 1/6  |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| a~1~ | 1    | 1    | 1    | 1    | 1    | 1    |
| a~2~ | 1    | 2    | 2    | 2    | 2    | 1    |
| a~3~ | 1    | 2    | 3    | 3    | 2    | 1    |
| a~4~ | 1    | 2    | 3    | 3    | 2    | 1    |
| a~5~ | 1    | 2    | 2    | 2    | 2    | 1    |
| a~6~ | 1    | 1    | 1    | 1    | 1    | 1    |

根据表格可得具有一定的对称性和规律，

可以通过预处理出n个分数之和来（前缀和，快速幂，逆元）

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
int mod=mod2;
int qpow(int base,int exp){
    int res=1;
    while (exp){
        if (exp&1) res=res*base%mod;
        base=base*base%mod;
        exp>>=1;
    }
    return res;
}
int inv(int n){
    return qpow(n,mod-2);
}
void solve(){    
    int n;
    cin>>n;
    vector<int> a(n+1);
    
   	//打表用
    // vector<vector<int> > t(n+1,vector<int> (n+1));
    // for (int i=1;i<=n;i++){
    //     for (int j=1;j<=n+1-i;j++){
    //         for (int k=1;k<=j;k++){
    //             t[i-1+k][j]++;
    //         }
    //     }
    // }
    // for (int i=1;i<=n;i++){
    //     for (int j=1;j<=n;j++){
    //         cout<<t[i][j]<<" \n"[j==n];
    //     }
    // }
    for (int i=1;i<=n;i++){
        cin>>a[i];
    }
    int ans=0;
    vector<int> pre(n+1);
    for (int i=1;i<=n;i++){
        pre[i]=(pre[i-1]+inv(i))%mod;
    }
    int t=pre[n];
    for (int i=1;i<=(n+1)/2;i++){
        int j=n-i+1;
        if (i!=j){
            ans=(ans+(a[i]+a[j])%mod*t%mod)%mod;
        }else{
            ans=(ans+(a[i])*t%mod)%mod;
        }
        t=(t+((pre[j-1]-pre[i])%mod+mod)%mod)%mod;
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

# [F - Chmax](https://atcoder.jp/contests/abc468/tasks/abc468_f)

## 题目描述

给你一个正整数 N，还有一个长度为 N的排列 P=(P~1~,P~2~,…,P~N~)，它是 (1,2,…,N) 的一个重排。

定义三个变量 x,y,c，初始时 x=y=c=0。

接下来，对于 k=1,2,…,N，你要依次执行以下两种操作中的一种：

- 操作 1：如果 x<P~k~ ，则 c 加 11；然后将 x 更新为 max⁡(x,P~k~)。
- 操作 2：如果 y<P~k~ ，则 c 加 11；然后将 y 更新为 max⁡(y,P~k~)。

你的任务是求出最终 c 能达到的最大值。

## 限制条件

- 1≤N≤5×10^5^
- P 是 (1,2,…,N) 的一个排列。
- 所有输入均为整数。

### 思路
（感谢学长的思路喵^_^）

这道题表面上看是一个需要同时维护 $x$ 和 $y$ 状态的动态规划问题，但通过分析变量的性质，可以将其简化为非常经典且高效的 **“前缀最大值 + 最长上升子序列 (LIS)”** 问题。

**核心观察**

1. $\max(x, y)$ 是恒定的

观察操作过程，每次将 $P_k$ 放入 $x$ 或 $y$ 时，较大的那个变量必然会被更新为当前的前缀最大值。
也就是说，在处理完前 $k$ 个元素后：


$$\max(x, y) = \max(P_1, P_2, \dots, P_k)$$

因为较大值是固定的，我们只需要关注**较小值** $\min(x, y)$ 的变化。

---

2. 按元素类型分类讨论

设处理到 $P_k$ 时，前 $k-1$ 个元素的最大值为 $M = \max(P_1, \dots, P_{k-1})$：

情况一：$P_k > M$（$P_k$ 是新的前缀最大值）

* 因为 $P_k$ 严格大于之前的 $x$ 和 $y$，所以无论将 $P_k$ 赋给 $x$ 还是 $y$，$c$ 都**必定增加 $1$**。
* 为了给后续操作留出更大的空间，最明智的做法是将 $P_k$ 放到原本较大的变量上，这样可以**保持较小值 $\min(x, y)$ 不变**。
* **结论**：每一个前缀最大值元素，都会无条件让答案 $c$ 加 $1$。

情况二：$P_k < M$（$P_k$ 不是前缀最大值）

* 此时 $P_k$ 只能尝试更新较小的值 $p = \min(x, y)$。
* 如果 $p < P_k$，我们可以把 $p$ 更新为 $P_k$，此时 $c$ 增加 $1$。
* 这与求解 **最长上升子序列 (LIS)** 的转移逻辑完全一致：只要新加入的数比前一个选择的数大，就能构成更长的递增链，从而让 $c$ 多加 $1$。

---

**最终结论**

1. 统计序列 $P$ 中所有满足 $P_k > \max(P_1, \dots, P_{k-1})$ 的元素数量，记为 **$A$**（即前缀最大值的个数）。
2. 将其余不满足该条件的元素按原顺序提取出来，组成新序列 **$Q$**。
3. 计算序列 $Q$ 的 **最长上升子序列长度 $\text{LIS}(Q)$**。

最终的最大 $c$ 值即为：


$$\text{Ans} = A + \text{LIS}(Q)$$

整体时间复杂度为 $O(N \log N)$，空间复杂度为 $O(N)$。

---

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
int get(vector<int> a){
    if (a.empty()) return 0;
    vector<int> lis;
    for (int x:a){
        auto it = lower_bound(lis.begin(), lis.end(), x);
        if (it == lis.end()) {
            lis.push_back(x);
        } else {
            *it = x;
        }
    }
    return lis.size();
}
void solve(){    
    int n;
    cin>>n;
    vector<int> p(n);
    for (int i=0;i<n;i++){
        cin>>p[i];
    }
    int premax=0;
    int curmax=-1;
    vector<int> q;
    for (int x:p){
        if (x>curmax){
            curmax=x;
            premax++;
        }else{
            q.push_back(x);
        }
    }
    int ans=premax+get(q);
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

