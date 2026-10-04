function EXPANDING_PCTL(range, invert) {
 const values = range.map(row => row[0]);
 const results = [];


 for (let i = 0; i < values.length; i++) {
   const target = values[i];
   if (target === '' || target === null || typeof target !== 'number') {
     results.push(['']);
     continue;
   }


   // Expanding window: values from row 1 through current row (inclusive)
   const window = values.slice(0, i + 1).filter(v => typeof v === 'number');
   const n = window.length;


   if (n <= 1) {
     // Only one data point — percentile undefined, return 0 by convention
     results.push([invert ? 100 : 0]);
     continue;
   }


   // Sort ascending, find first and last occurrence of target (0-indexed)
   const sorted = [...window].sort((a, b) => a - b);
   let first = -1;
   let last = -1;
   for (let j = 0; j < n; j++) {
     if (sorted[j] === target) {
       if (first === -1) first = j;
       last = j;
     }
   }


   const midpoint = (first + last) / 2;
   const percentile = (midpoint / (n - 1)) * 100;


   results.push([invert ? 100 - percentile : Number(percentile.toFixed(2))]);
 }


 return results;
}

