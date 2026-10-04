# M-Index Out-of-Sample Backtest (Rolling-Origin)

## Overview

This document describes the rolling-origin out-of-sample backtest of the
M-Index, presented as Figures 6 and 7 in the paper *The M-Index: A Tool for
Understanding the Economy in Real Time*. Unlike the main M-Index, which
scores each month against the full 30-year distribution, the rolling-origin
backtest scores each month against only the data that would have been
available at that point in time. This addresses retrospective tuning
concerns by ensuring no future information leaks into earlier scores.

The out-of-sample data lives in the "(2)" tabs of
[`M-Index Data.xlsx`](M-Index%20Data.xlsx), and as a live Google Sheet:
https://docs.google.com/spreadsheets/d/1C4TghR8GXsK6ZVUE7ZjF6h6FRvLjxvWdCmphI8OKeLQ/edit?usp=sharing.
The scoring mechanism is implemented by the `EXPANDING_PCTL` custom function
in [`code/expanding_pctl.gs`](code/expanding_pctl.gs); the raw indicator data
is populated by the fetch functions in
[`code/fred_fetch_functions.gs`](code/fred_fetch_functions.gs).

## What Is Different From the Main M-Index

- The main M-Index uses a **fixed 30-year reference distribution**. Each
  month's percentile rank is computed against the full 1995–2026
  distribution.
- The out-of-sample backtest uses an **expanding window** reference
  distribution. For each month *t*, the percentile rank is computed against
  only the data from the start of the analysis window through month *t*.
  Earlier months are scored against shorter reference distributions; later
  months are scored against progressively longer ones. This is the
  rolling-origin methodology described in the paper.
- The mechanism is implemented via a custom Apps Script function called
  `EXPANDING_PCTL`, which is called directly from spreadsheet formulas. The
  function takes a value and a range, and returns the percentile rank of the
  value against the portion of the range that ends at that row.

## Tab Guide ("(2)" tabs in the data file)

- **Composite Scores (2)**: Month-by-month rolling-origin M-Index value.
  Each value is the equal-weighted average of the 8 sector scores for that
  month, where each sector score is computed from indicator percentiles
  ranked against only the data available up to that month.
- **Historical Sector Scores (2)**: Month-by-month rolling-origin score for
  each of the 8 sectors. Each sector score is the average of the 0–100
  directionality-adjusted expanding-window percentile ranks of the
  indicators in that sector for that month.
- **Individual indicator tabs (2)**: The Date, Value, and 6M % Change
  columns are copied directly from the main tabs (same raw FRED or
  Macrotrends data). The Percentile Score column is replaced with values
  computed by the `EXPANDING_PCTL` function so that each month's score
  reflects only the data available at that point in time.

## Methodology Summary

1. The same 20 indicators and 8 sectors as the main M-Index are used.
2. For each month *t*, each indicator's percentile rank is computed against
   the distribution of that indicator's values from the start of the
   analysis window through month *t* — not against the full 30-year
   distribution.
3. Directionality inversion is applied identically to the main M-Index
   (where `invertDirection = TRUE`, the percentile becomes 100 −
   percentile).
4. Sector scores and the composite M-Index are computed by the same
   averaging operations as the main M-Index.

## Why Values Differ From the Main M-Index

Because the reference distribution is shorter and changes month to month,
rolling-origin scores differ from in-sample scores in two systematic ways:

- **Earlier extremes look more extreme.** When a value occurs near the start
  of the time series, the reference distribution is short and the value's
  percentile is calculated against fewer comparison points, which can shift
  the percentile rank up or down meaningfully.
- **Later values converge to the in-sample result.** As the reference
  distribution grows toward the full 30 years, rolling-origin values
  approach the in-sample values. By 2020, the reference distribution
  contains roughly 25 of the 30 years used in the main M-Index, so
  rolling-origin and in-sample COVID values are similar.

The paper discusses these differences in the Out-of-Sample Backtesting
subsection of the Results section.

The same 0–100 score bands and snapshot dates as the main M-Index apply —
see the [main README](README.md).

