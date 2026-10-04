# M-Index Apps Script Code

## Overview

This folder contains the Apps Script code used to fetch indicator data from
FRED, compute 6-month percentage changes (where applicable), and assign
30-year percentile scores for the M-Index. Each function in
[`fred_fetch_functions.gs`](fred_fetch_functions.gs) corresponds to one
indicator and writes its data to a dedicated tab in the M-Index spreadsheet.
The final function in that file, `runCorrelationMatrix`, computes the 23×23
Pearson correlation matrix used during indicator selection.

## Setup

Replace `YOUR_FRED_API_KEY_HERE` in every function with a free FRED API key,
available at https://fred.stlouisfed.org/docs/api/api_key.html.

## Functions Included

`fred_fetch_functions.gs` contains 21 indicator functions and 1 correlation
matrix function:

- **19 indicator functions** corresponding to the 19 FRED-sourced indicators
  in the final M-Index. The 20th indicator (S&P 500) was pulled directly from
  Macrotrends as monthly closing values rather than via Apps Script.
- **2 indicator functions for dropped indicators** (BAMLH0A0HYM2 and DGORDER)
  included only for reproducibility of the |r| > 0.85 correlation screening
  that justified their removal. These functions are not required to compute
  the M-Index itself.
- **1 correlation matrix function** (`runCorrelationMatrix`) which computes
  the full 23×23 Pearson correlation matrix referenced in the paper.

## How Each Function Works

Each indicator function follows the same structure:

1. Fetches monthly observations from the FRED `/series/observations` endpoint
2. Optionally computes a 6-month percentage change (for `_6m` functions)
3. Builds a sorted distribution of all valid values
4. Assigns each observation a 0–100 percentile rank against the full
   historical distribution, with midpoint tie-handling
5. If `invertDirection = true`, flips the score so higher = worse economic
   conditions
6. Writes Date, Value, 6M % Change (where applicable), and Percentile Score
   to a dedicated sheet tab

## Notes on Specific Functions

- S&P 500 and Dow Jones Industrial Average are not included as Apps Script
  functions because their data was downloaded directly from Macrotrends as
  monthly closing values rather than fetched from FRED.
- NASDAQCOM uses FRED's `aggregation_method=eop` parameter to retrieve
  monthly closing values rather than monthly averages, matching the
  aggregation method used for S&P 500.
- Quarterly indicators (GDPC1, GFDEGDQ188S) are pulled at quarterly frequency
  and disaggregated to monthly within the spreadsheet, with appropriate
  publication lag shifts applied.

## Reproducing the M-Index

1. Create a new Google Sheet
2. Copy each function into the Apps Script editor (Extensions → Apps Script)
3. Replace the API key placeholder
4. Run each function. Each writes data to a new tab named after the indicator.
5. Build sector averages and the composite score by following the methodology
   described in the paper.

---

# Out-of-Sample Code: `EXPANDING_PCTL`

## Overview

[`expanding_pctl.gs`](expanding_pctl.gs) contains the custom Apps Script
function used to compute rolling-origin percentile ranks in the out-of-sample
M-Index spreadsheet. Unlike the main M-Index, which scores each month against
the full 30-year distribution, the rolling-origin methodology scores each
month against only the data available at that point in time.

Companion out-of-sample spreadsheet:
https://docs.google.com/spreadsheets/d/1C4TghR8GXsK6ZVUE7ZjF6h6FRvLjxvWdCmphI8OKeLQ/edit?usp=sharing
— calls `EXPANDING_PCTL` from spreadsheet formulas to produce the
rolling-origin percentile scores in each indicator tab.

## Setup

This function does not require an API key. It is called directly from
spreadsheet formulas and operates on data already present in the spreadsheet.

To use:

1. In the OOS spreadsheet, open the Apps Script editor (Extensions → Apps
   Script).
2. Paste the function into a new script file.
3. Save and reload the spreadsheet.
4. Call from any cell using `=EXPANDING_PCTL(range, invert)` where `range` is
   a column of indicator values and `invert` is TRUE or FALSE according to
   the indicator's directionality (matching the convention in the main
   spreadsheet's Indicator Reference tab).

## How the Function Works

For each row in the input range, `EXPANDING_PCTL` computes the percentile
rank of that row's value against the distribution of all values from the
start of the range through the current row (the expanding window). Earlier
rows are scored against shorter windows; later rows are scored against
progressively longer ones, ensuring no future information leaks into earlier
scores. The function uses midpoint tie-handling identical to the main M-Index
methodology, and applies directionality inversion (returning 100−percentile)
when `invert=TRUE`.
