# The M-Index

A real-time, 0–100 "thermometer" for the U.S. economy, built from 20 publicly
available macroeconomic indicators across 8 sectors. Published in the
*National High School Journal of Science* (2026):
[Read the paper](https://nhsjs.com/2026/the-m-index-a-tool-for-understanding-the-economy-in-real-time/#section-supplementary-information)

## Overview

This repository contains the full pipeline for the M-Index analysis presented
in the paper *The M-Index: A Tool for Understanding the Economy in Real
Time*. It includes the raw indicator data, percentile scores, sector
averages, and final composite M-Index values from July 1995 to February 2026,
as well as the rolling-origin out-of-sample backtest used to generate
Figures 6 and 7.

## Repository Contents

- **`code/`** — the Apps Script used to fetch indicator data from FRED and
  compute percentile scores, the 23×23 correlation matrix script, and the
  `EXPANDING_PCTL` function for the rolling-origin backtest. See
  [`code/README.md`](code/README.md) for setup.
- **`M-Index Data.xlsx`** — the full reproducibility supplement (51 tabs),
  described in the Tab Guide below. The out-of-sample backtest tabs are
  marked "(2)".

Live, auto-refreshing Google Sheets versions:
[Main spreadsheet](https://docs.google.com/spreadsheets/d/1r9ygd5MNm6mapfAEs0dqjwoYbIYhAM0kUfRm6ZbIhOQ/edit?gid=482114845#gid=482114845) ·
[Out-of-sample spreadsheet](https://docs.google.com/spreadsheets/d/1C4TghR8GXsK6ZVUE7ZjF6h6FRvLjxvWdCmphI8OKeLQ/edit?usp=sharing)


## Tab Guide

- **Indicator Reference**: Master table listing all 20 final M-Index
  indicators with their FRED code, sector, source, frequency, publication
  lag, directionality, and transformation.
- **Correlation Matrix (All 23)**: 23×23 Pearson correlation matrix computed
  across the original 23 candidate indicators. Pairs with |r| > 0.85 are
  highlighted in red. Three pairs were flagged:
  - High Yield Bond Spread × Corporate Bond Spread (r ≈ 0.93)
  - Durable Goods Orders × Manufacturers' New Orders (r ≈ 0.93)
  - S&P 500 × Dow Jones Industrial Average (r ≈ 0.94).
  
  One indicator from each pair was dropped per the methodology described in
  the paper.
- **Composite Scores**: Month-by-month final M-Index value from July 1995 to
  February 2026. Each value is the equal-weighted average of the 8 sector
  scores for that month.
- **Historical Sector Scores**: Month-by-month sector scores for each of the
  8 sectors (Labor Market, Credit Conditions, Monetary Policy, Consumer
  Demand, Production, Housing, Equity Market, Structural Health). Each
  sector score is the average of the 0–100 directionality-adjusted percentile
  ranks of the indicators in that sector for that month.
- **Individual indicator tabs** (e.g., UNRATE, AWHMAN, BAA10Y, ICSA_6m,
  etc.): Raw FRED or Macrotrends values, computed transformations (e.g.,
  6-month % change), and the assigned percentile score for every month in
  the analysis window.

## Methodology Summary

1. Twenty-three macroeconomic indicators were assembled across eight sectors.
2. Each indicator's monthly value was assigned a 0–100 percentile rank
   against the full 30-year distribution, with midpoint tie-handling.
3. For indicators where higher values indicate a stronger economy, the
   percentile was inverted to 100−percentile, so all scores follow the
   convention of higher = worse.
4. A 23×23 correlation matrix was used to drop three indicators
   (BAMLH0A0HYM2, DGORDER, Dow Jones), leaving 20 final indicators.
5. Each month's 20 indicator scores were averaged within each of the 8
   sectors to produce 8 sector scores.
6. The 8 sector scores were averaged with equal weight to produce the final
   M-Index composite for that month.

## Score Bands

The M-Index uses a 0–100 scale with the following ordinal bands. The lower
bound is inclusive and the upper bound is exclusive, except for the top band
which is inclusive of 100.

| Range | Band |
|---|---|
| 0–30 | Excellent |
| 30–45 | Normal |
| 45–60 | Warning |
| 60–70 | Mild stress |
| 70–80 | Severe stress |
| 80–100 | Extreme stress |

## Column Conventions

Each individual indicator tab uses the following columns:

- **Date**: First day of the month
- **Value**: Raw indicator value as published by the source
- **6M % Change**: 6-month percentage change from the value 6 months prior
  (only present on `_6m` tabs)
- **Percentile Score**: 0–100 percentile rank against the full historical
  distribution, with directionality applied (where higher = worse for all
  final scores)

The Indicator Reference tab includes a Directionality (`invertDirection`)
column. FALSE indicates higher raw values correspond to worse economic
conditions and the percentile is used as-is. TRUE indicates higher raw values
correspond to better economic conditions, in which case the percentile is
replaced with 100−percentile so that the final score follows the convention
of higher = worse.

## Notes on Specific Indicators

- S&P 500 was downloaded from Macrotrends as monthly closing values. FRED's
  S&P 500 series only has 10 years of historical data, which is insufficient
  for the 30-year percentile scoring.
- Dow Jones Industrial Average data was also downloaded from Macrotrends to
  enable the |r| > 0.85 correlation screening described above. Dow Jones was
  subsequently dropped and is not part of the final M-Index.
- High Yield Bond Spread (BAMLH0A0HYM2) data was downloaded in March 2026
  prior to FRED's restriction of historical coverage to 3 years. The
  indicator was subsequently dropped per the correlation screening.
- NASDAQ Composite (NASDAQCOM) is fetched using FRED's
  `aggregation_method=eop` parameter to retrieve monthly closing values,
  matching the aggregation method used for S&P 500.
- Quarterly indicators (GDPC1, GFDEGDQ188S) are disaggregated to a monthly
  frequency by assigning each quarterly value to the three corresponding
  months, then shifted forward by their publication lag.

## Snapshot Date

Data downloaded April 2026, except for High Yield Bond Spread (downloaded
March 2026 — see above).

## Citation

> Tammana, M. (2026). The M-Index: A Tool for Understanding the Economy in
> Real Time. *National High School Journal of Science.*

## License

MIT — see [LICENSE](LICENSE)
