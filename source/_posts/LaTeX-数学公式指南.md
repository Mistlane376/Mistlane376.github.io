---
title: LaTeX 数学公式指南
abbrlink: LaTeX-Learning
date: 2026-08-05 21:21:26
tags:
  - 知识学习
  - 总结
categories:
  - 教程
description: LaTeX 数学公式便于题解书写
cover: /images/selection4.jpg
mathjax: true
---

---

# LaTeX 数学公式速查指南（Typora 版）

> 本指南适用于 Typora、Obsidian、Jupyter Notebook、知乎等支持 LaTeX 数学渲染的环境。  
> **Typora 设置**：`偏好设置 → Markdown → 勾选“内联公式”`。

---

## 1. 基础语法

| 功能 | LaTeX 代码 | 渲染效果 |
| :--- | :--- | :--- |
| 上标 | `x^2` 或 `x^{a+b}` | $x^2$，$x^{a+b}$ |
| 下标 | `x_2` 或 `x_{a+b}` | $x_2$，$x_{a+b}$ |
| 上下标结合 | `x_1^2` 或 `x_{ij}^{2k}` | $x_1^2$ |
| 分数 | `\frac{分子}{分母}` | $\frac{a}{b}$ |
| 平方根 | `\sqrt{x}` | $\sqrt{x}$ |
| n 次方根 | `\sqrt[n]{x}` | $\sqrt[n]{x}$ |
| 绝对值 | `\lvert x \rvert` | $\lvert x \rvert$ |
| 组合数 | `\binom{n}{k}` | $\binom{n}{k}$ |

---

## 2. 希腊字母

| 小写 | 代码 | 大写 | 代码 |
| :--- | :--- | :--- | :--- |
| $\alpha$ | `\alpha` | $A$ | `A` |
| $\beta$ | `\beta` | $B$ | `B` |
| $\gamma$ | `\gamma` | $\Gamma$ | `\Gamma` |
| $\delta$ | `\delta` | $\Delta$ | `\Delta` |
| $\epsilon$ | `\epsilon` | $E$ | `E` |
| $\zeta$ | `\zeta` | $Z$ | `Z` |
| $\eta$ | `\eta` | $H$ | `H` |
| $\theta$ | `\theta` | $\Theta$ | `\Theta` |
| $\iota$ | `\iota` | $I$ | `I` |
| $\kappa$ | `\kappa` | $K$ | `K` |
| $\lambda$ | `\lambda` | $\Lambda$ | `\Lambda` |
| $\mu$ | `\mu` | $M$ | `M` |
| $\nu$ | `\nu` | $N$ | `N` |
| $\xi$ | `\xi` | $\Xi$ | `\Xi` |
| $\omicron$ | `\omicron` | $O$ | `O` |
| $\pi$ | `\pi` | $\Pi$ | `\Pi` |
| $\rho$ | `\rho` | $P$ | `P` |
| $\sigma$ | `\sigma` | $\Sigma$ | `\Sigma` |
| $\tau$ | `\tau` | $T$ | `T` |
| $\upsilon$ | `\upsilon` | $\Upsilon$ | `\Upsilon` |
| $\phi$ | `\phi` | $\Phi$ | `\Phi` |
| $\chi$ | `\chi` | $X$ | `X` |
| $\psi$ | `\psi` | $\Psi$ | `\Psi` |
| $\omega$ | `\omega` | $\Omega$ | `\Omega` |

---

## 3. 二元运算符

| 功能 | 代码 | 效果 |
| :--- | :--- | :--- |
| 加 | `+` | $+$ |
| 减 | `-` | $-$ |
| 乘（点） | `\cdot` | $\cdot$ |
| 乘（叉） | `\times` | $\times$ |
| 除 | `\div` | $\div$ |
| 正负 / 负正 | `\pm` / `\mp` | $\pm$ / $\mp$ |
| 圆点（向量点乘） | `\bullet` | $\bullet$ |
| 星号（卷积） | `\ast` | $\ast$ |
| 圈加（异或） | `\oplus` | $\oplus$ |
| 圈乘（同或/张量） | `\otimes` | $\otimes$ |
| 圈点 | `\odot` | $\odot$ |
| 模运算 | `a \bmod b` | $a \bmod b$ |

---

## 4. 关系运算符

| 功能 | 代码 | 效果 |
| :--- | :--- | :--- |
| 等于 | `=` | $=$ |
| 不等于 | `\neq` 或 `\ne` | $\neq$ |
| 约等于 | `\approx` | $\approx$ |
| 大于等于 | `\geq` 或 `\ge` | $\geq$ |
| 小于等于 | `\leq` 或 `\le` | $\leq$ |
| 远大于/远小于 | `\gg` / `\ll` | $\gg$ / $\ll$ |
| 恒等于 | `\equiv` | $\equiv$ |
| 相似 | `\sim` | $\sim$ |
| 近似 | `\simeq` | $\simeq$ |
| 正比于 | `\propto` | $\propto$ |
| 属于 | `\in` | $\in$ |
| 不属于 | `\notin` | $\notin$ |
| 包含（反向属于） | `\ni` 或 `\owns` | $\ni$ |
| 子集 | `\subset` | $\subset$ |
| 子集或等 | `\subseteq` | $\subseteq$ |
| 真子集 | `\subsetneq` | $\subsetneq$ |
| 超集 | `\supset` | $\supset$ |
| 超集或等 | `\supseteq` | $\supseteq$ |
| 并集 | `\cup` | $\cup$ |
| 交集 | `\cap` | $\cap$ |
| 空集 | `\varnothing` 或 `\emptyset` | $\varnothing$ |
| 全称量词 | `\forall` | $\forall$ |
| 存在量词 | `\exists` | $\exists$ |
| 不存在 | `\nexists` | $\nexists$ |

---

## 5. 大型运算符

| 功能 | 代码 | 效果 |
| :--- | :--- | :--- |
| 求和（行内） | `\sum_{i=1}^{n} a_i` | $\sum_{i=1}^{n} a_i$ |
| 求和（独立公式） | `$$\sum_{i=1}^{n} a_i$$` | 居中显示，上下标更大 |
| 累乘 | `\prod_{i=1}^{n} a_i` | $\prod_{i=1}^{n} a_i$ |
| 积分 | `\int_{a}^{b} f(x) dx` | $\int_{a}^{b} f(x) dx$ |
| 二重积分 | `\iint` | $\iint$ |
| 三重积分 | `\iiint` | $\iiint$ |
| 曲线积分 | `\oint` | $\oint$ |
| 极限 | `\lim_{x \to \infty} f(x)` | $\lim_{x \to \infty} f(x)$ |
| 批量异或（大运算符） | `\bigoplus_{i=1}^{n} A_i` | $\bigoplus_{i=1}^{n} A_i$ |
| 批量交集/并集 | `\bigcap` / `\bigcup` | $\bigcap$ / $\bigcup$ |

> **提示**：在独立公式（`$$...$$`）中，上下标会自动放在求和/积分符号的正上方/正下方；行内公式中默认放在右侧。

---

## 6. 括号与定界符（自动缩放）

| 普通写法（不缩放） | 自动缩放写法 | 效果 |
| :--- | :--- | :--- |
| `(\frac{a}{b})` | `\left( \frac{a}{b} \right)` | $\left( \frac{a}{b} \right)$ |
| `[\frac{a}{b}]` | `\left[ \frac{a}{b} \right]` | $\left[ \frac{a}{b} \right]$ |
| `\{\frac{a}{b}\}` | `\left\{ \frac{a}{b} \right\}` | $\left\{ \frac{a}{b} \right\}$ |
| `\lvert x \rvert` | 本身已定界 | $\lvert x \rvert$ |
| 上取整 | `\left\lceil x \right\rceil` | $\left\lceil x \right\rceil$ |
| 下取整 | `\left\lfloor x \right\rfloor` | $\left\lfloor x \right\rfloor$ |
| 尖括号 | `\left\langle x \right\rangle` | $\left\langle x \right\rangle$ |

> 如果只需要一个定界符，可以用 `\left.` 或 `\right.` 作为占位符（不显示）。  
> 例：`\left. \frac{dy}{dx} \right|_{x=0}` → $\left. \frac{dy}{dx} \right|_{x=0}$

---

## 7. 矩阵

使用 `\begin{matrix} ... \end{matrix}`，`&` 分隔列，`\\` 分隔行。

| 类型 | 代码 | 效果 |
| :--- | :--- | :--- |
| 无括号 | `\begin{matrix} 1 & 2 \\ 3 & 4 \end{matrix}` | $\begin{matrix} 1 & 2 \\ 3 & 4 \end{matrix}$ |
| 圆括号 | `\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}` | $\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}$ |
| 方括号 | `\begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}` | $\begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}$ |
| 花括号 | `\begin{Bmatrix} 1 & 2 \\ 3 & 4 \end{Bmatrix}` | $\begin{Bmatrix} 1 & 2 \\ 3 & 4 \end{Bmatrix}$ |
| 竖线（行列式） | `\begin{vmatrix} 1 & 2 \\ 3 & 4 \end{vmatrix}` | $\begin{vmatrix} 1 & 2 \\ 3 & 4 \end{vmatrix}$ |
| 双竖线（范数） | `\begin{Vmatrix} 1 & 2 \\ 3 & 4 \end{Vmatrix}` | $\begin{Vmatrix} 1 & 2 \\ 3 & 4 \end{Vmatrix}$ |

> 矩阵中可以插入省略号：`\cdots`（横向）、`\vdots`（竖向）、`\ddots`（对角线）。

---

## 8. 多行公式（对齐）

使用 `\begin{aligned} ... \end{aligned}` 环境，用 `&` 标记对齐位置，`\\` 换行。

```latex
\begin{aligned}
f(x) & = (a+b)^2 \\
     & = a^2 + 2ab + b^2
\end{aligned}
```

渲染效果：

$$
\begin{aligned}
f(x) & = (a+b)^2 \\
     & = a^2 + 2ab + b^2
\end{aligned}
$$

---

## 9. 分段函数（cases 环境）

```latex
f(x) = 
\begin{cases}
x^2, & x \ge 0 \\
-x, & x < 0
\end{cases}
```

效果：

$$
f(x) = 
\begin{cases}
x^2, & x \ge 0 \\
-x, & x < 0
\end{cases}
$$

---

## 10. 顶部符号（修饰符）

| 功能           | 代码                     | 效果                       |
| :------------- | :----------------------- | :------------------------- |
| 横线（平均）   | `\bar{x}`                | $\bar{x}$                |
| 长横线（上方） | `\overline{ABC}`         | $\overline{ABC}$         |
| 向量箭头       | `\vec{v}`                | $\vec{v}$                |
| 箭头（长）     | `\overrightarrow{AB}`    | $\overrightarrow{AB}$    |
| 帽子（估计）   | `\hat{x}`                | $\hat{x}$                |
| 宽帽子         | `\widehat{ABC}`          | $\widehat{ABC}$          |
| 点（导数）     | `\dot{x}`                | $\dot{x}$                |
| 双点（二阶导） | `\ddot{x}`               | $\ddot{x}$               |
| 波浪线         | `\tilde{x}`              | $\tilde{x}$              |
| 宽波浪         | `\widetilde{ABC}`        | $\widetilde{ABC}$        |
| 下箭头（极限） | `\underset{x\to0}{f(x)}` | $\underset{x\to0}{f(x)}$ |

---

## 11. 常见函数名（正体）

在 LaTeX 中，标准函数名应用 `\` 前缀以显示为正体，避免被当作变量（斜体）。

| 代码      | 效果        | 代码      | 效果        |
| :-------- | :---------- | :-------- | :---------- |
| `\sin`    | $\sin$    | `\cos`    | $\cos$    |
| `\tan`    | $\tan$    | `\cot`    | $\cot$    |
| `\sec`    | $\sec$    | `\csc`    | $\csc$    |
| `\arcsin` | $\arcsin$ | `\arccos` | $\arccos$ |
| `\arctan` | $\arctan$ | `\sinh`   | $\sinh$   |
| `\cosh`   | $\cosh$   | `\tanh`   | $\tanh$   |
| `\log`    | $\log$    | `\ln`     | $\ln$     |
| `\lg`     | $\lg$     | `\exp`    | $\exp$    |
| `\max`    | $\max$    | `\min`    | $\min$    |
| `\lim`    | $\lim$    | `\sup`    | $\sup$    |
| `\inf`    | $\inf$    | `\deg`    | $\deg$    |

---

## 12. 箭头

| 代码                   | 效果                | 代码              | 效果                |
| :--------------------- | :------------------ | :---------------- | :------------------ |
| `\to` 或 `\rightarrow` | $\to$             | `\leftarrow`      | $\leftarrow$      |
| `\Rightarrow`          | $\Rightarrow$     | `\Leftarrow`      | $\Leftarrow$      |
| `\leftrightarrow`      | $\leftrightarrow$ | `\Leftrightarrow` | $\Leftrightarrow$ |
| `\longrightarrow`      | $\longrightarrow$ | `\longleftarrow`  | $\longleftarrow$  |
| `\Longrightarrow`      | $\Longrightarrow$ | `\Longleftarrow`  | $\Longleftarrow$  |
| `\mapsto`              | $\mapsto$         | `\longmapsto`     | $\longmapsto$     |
| `\uparrow`             | $\uparrow$        | `\downarrow`      | $\downarrow$      |
| `\updownarrow`         | $\updownarrow$    | `\Uparrow`        | $\Uparrow$        |
| `\Downarrow`           | $\Downarrow$      | `\Updownarrow`    | $\Updownarrow$    |
| `\nearrow`             | $\nearrow$        | `\searrow`        | $\searrow$        |
| `\swarrow`             | $\swarrow$        | `\nwarrow`        | $\nwarrow$        |

---

## 13. 逻辑与集合常用符号

| 功能         | 代码                         | 效果                 |
| :----------- | :--------------------------- | :------------------- |
| 与（AND）    | `\land` 或 `\wedge`          | $\land$            |
| 或（OR）     | `\lor` 或 `\vee`             | $\lor$             |
| 非（NOT）    | `\lnot` 或 `\neg`            | $\lnot$ / $\neg$ |
| 异或（XOR）  | `\oplus`                     | $\oplus$           |
| 同或（XNOR） | `\odot`                      | $\odot$            |
| 蕴含         | `\implies`                   | $\implies$         |
| 等价         | `\iff`                       | $\iff$             |
| 空集         | `\varnothing` 或 `\emptyset` | $\varnothing$      |
| 自然数集     | `\mathbb{N}`                 | $\mathbb{N}$       |
| 整数集       | `\mathbb{Z}`                 | $\mathbb{Z}$       |
| 有理数集     | `\mathbb{Q}`                 | $\mathbb{Q}$       |
| 实数集       | `\mathbb{R}`                 | $\mathbb{R}$       |
| 复数集       | `\mathbb{C}`                 | $\mathbb{C}$       |

---

## 14. 常用特殊符号

| 功能             | 代码         | 效果                            |
| :--------------- | :----------- | :------------------------------ |
| 无穷             | `\infty`     | $\infty$                      |
| 偏导数           | `\partial`   | $\partial$                    |
| 梯度（nabla）    | `\nabla`     | $\nabla$                      |
| 点乘（求导）     | `\cdot`      | $\cdot$                       |
| 三角形（三角形） | `\triangle`  | $\triangle$                   |
| 角度             | `\angle`     | $\angle$                      |
| 度符号           | `^\circ`     | $^\circ$（例如 $30^\circ$） |
| 平行             | `\parallel`  | $\parallel$                   |
| 垂直             | `\perp`      | $\perp$                       |
| 因为             | `\because`   | $\because$                    |
| 所以             | `\therefore` | $\therefore$                  |
| 存在唯一         | `\exists!`   | $\exists!$                    |

---

## 15. 字体与颜色

| 功能               | 代码                 | 效果                   |
| :----------------- | :------------------- | :--------------------- |
| 黑板粗体（数集）   | `\mathbb{R}`         | $\mathbb{R}$         |
| 花体（手写）       | `\mathcal{L}`        | $\mathcal{L}$        |
| 哥特体（德文）     | `\mathfrak{P}`       | $\mathfrak{P}$       |
| 直立罗马体（文字） | `\mathrm{ABC}`       | $\mathrm{ABC}$       |
| 加粗               | `\mathbf{x}`         | $\mathbf{x}$         |
| 斜体（默认）       | `x`                  | $x$                  |
| 颜色（红色）       | `\color{red}{x}`     | $\color{red}{x}$     |
| 颜色（自定义）     | `\color[HTML]{FF00FF}{y}` | $\color[HTML]{FF00FF}{y}$ |

> 颜色需要环境支持（KaTeX 部分支持，MathJax 完全支持）。

---

## 16. 行内与独立公式

- **行内公式**：`$ ... $`  
  例：`$E = mc^2$` → $E = mc^2$

- **独立公式（居中）**：`$$ ... $$`  
  例：
  ```latex
  $$
  E = mc^2
  $$
  ```
  效果（居中）：

  $$
  E = mc^2
  $$

- **编号公式**（需额外宏包，Typora 默认不支持自动编号，但可手动添加标签）：
  ```latex
  $$
  \tag{1.2} E = mc^2
  $$
  ```

---

## 17. 常用数学环境汇总

| 环境                             | 用途                           | 示例                                     |
| :------------------------------- | :----------------------------- | :--------------------------------------- |
| `matrix` / `pmatrix` / `bmatrix` | 矩阵                           | 见第 7 节                                |
| `aligned`                        | 多行对齐                       | 见第 8 节                                |
| `cases`                          | 分段函数                       | 见第 9 节                                |
| `gathered`                       | 多行居中无对齐                 | `\begin{gathered} a \\ b \end{gathered}` |
| `split`                          | 公式拆行，单一编号（宏包支持） | 类似 aligned                             |

---

## 18. 快速参考：常见组合示例

```latex
$ \binom{n}{k} $                          % 组合数
$ \mathbb{R} $                            % 实数集
$ x \in A, y \notin B $                   % 属于与不属于
$ \sum_{i=1}^{n} i^2 $                    % 求和
$ \lim_{x \to 0} \frac{\sin x}{x} = 1 $   % 极限
$ \left( \frac{1}{2} \right) $            % 自动缩放括号
$ \begin{pmatrix} a & b \\ c & d \end{pmatrix} $ % 矩阵
$ \displaystyle \int_{0}^{1} x^2 dx $     % 强制显示大号积分（行内）
```

---

## 19. 更多技巧

- **强制显示为行内/独立样式**：`\displaystyle` 让行内公式显示为独立公式样式（求和上下标在正上方），`\textstyle` 反之。
- **空格控制**：LaTeX 忽略普通空格，用 `\,`（小空格）、`\:`（中空格）、`\;`（大空格）、`\quad`（一个汉字宽）、`\qquad`（两个汉字宽）来调整间距。
- **换行**：在独立公式中用 `\\` 换行（需在 align 等环境中）。

---

*最后更新：2026-08-05*  
*适用于 Typora 0.11+，MathJax 3 和 KaTeX 环境。*
