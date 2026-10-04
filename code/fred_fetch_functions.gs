function fetchFRED_AMTMNO_6m() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'AMTMNO';
 const sheetName = seriesId + "_6m";
 const observationStart = '1994-10-01';
 const invertDirection = true; // true for indicators where higher change value = better economy


 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < observations.length; i++) {
   const value = parseFloat(observations[i].value);
   const date = observations[i].date;


   allDates.push([date]);
   allValues.push([isNaN(value) ? null : Number(value.toFixed(2))]);


   if (i >= 6) {
     const oldValue = parseFloat(observations[i - 6].value);
     if (!isNaN(value) && !isNaN(oldValue) && oldValue !== 0) {
       const percentChange = ((value - oldValue) / oldValue) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 // Build sorted array from valid change values
 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 // Percentile scores based on change values, not raw values
 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "6M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}



function fetchFRED_AWHMAN() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'AWHMAN';
 const sheetName = seriesId;
 const invertDirection = true; // true for indicators where higher value = better economy (e.g., GDP)


 // Pull monthly data starting April 1995 for raw indicators
 const observationStart = '1995-04-01';
 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];


 for (let obs of observations) {
   const value = parseFloat(obs.value);
   allDates.push([obs.date]);
   allValues.push([isNaN(value) ? null : value]);
 }


 const validValues = allValues
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validValues].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   // Find first and last occurrence for midpoint tie handling
   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   // Fallback: value falls between two sorted values
   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 const allScores = allValues.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 3).setValues([["Date", "Value", "Percentile Score"]]);


 const displayValues = allValues.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, displayValues.length, 1).setValues(displayValues);
 sheet.getRange(2, 3, allScores.length, 1).setValues(allScores);
}



function fetchFRED_BAA10Y() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'BAA10Y';
 const sheetName = seriesId;
 const invertDirection = false; // true for indicators where higher value = better economy (e.g., GDP)


 // Pull monthly data starting April 1995
 const observationStart = '1995-04-01';
 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}` +
             `&frequency=m&aggregation_method=avg`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];


 for (let obs of observations) {
   const value = parseFloat(obs.value);
   allDates.push([obs.date]);
   allValues.push([isNaN(value) ? null : value]);
 }


 const validValues = allValues
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validValues].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   // Find first and last occurrence for midpoint tie handling
   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   // Fallback: value falls between two sorted values
   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 const allScores = allValues.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 3).setValues([["Date", "Value", "Percentile Score"]]);


 const displayValues = allValues.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, displayValues.length, 1).setValues(displayValues);
 sheet.getRange(2, 3, allScores.length, 1).setValues(allScores);
}



function fetchFRED_BAMLH0A0HYM2() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'BAMLH0A0HYM2';
 const sheetName = seriesId;
 const invertDirection = false; // true for indicators where higher value = better economy (e.g., GDP)


 // Pull daily series aggregated to monthly average, starting April 1995
 const observationStart = '1995-04-01';
 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
           `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}` +
           `&frequency=m&aggregation_method=avg&limit=100000`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 Logger.log("Total observations: " + observations.length);
Logger.log("First date: " + observations[0].date);
Logger.log("Last date: " + observations[observations.length - 1].date);


 const allDates = [];
 const allValues = [];


 for (let obs of observations) {
   const value = parseFloat(obs.value);
   allDates.push([obs.date]);
   allValues.push([isNaN(value) ? null : value]);
 }


 const validValues = allValues
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validValues].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   // Find first and last occurrence for midpoint tie handling
   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   // Fallback: value falls between two sorted values
   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 const allScores = allValues.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 3).setValues([["Date", "Value", "Percentile Score"]]);


 const displayValues = allValues.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, displayValues.length, 1).setValues(displayValues);
 sheet.getRange(2, 3, allScores.length, 1).setValues(allScores);
}

function fetchFRED_CPIAUCSL_6m() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'CPIAUCSL';
 const sheetName = seriesId + "_6m";
 const invertDirection = true; // true for indicators where higher change value = better economy


 // Pull monthly data starting Oct 1994
 const observationStart = '1994-10-01';
 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}` +
             `&frequency=m&aggregation_method=avg`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < observations.length; i++) {
   const value = parseFloat(observations[i].value);
   const date = observations[i].date;


   allDates.push([date]);
   allValues.push([isNaN(value) ? null : Number(value.toFixed(2))]);


   if (i >= 6) {
     const oldValue = parseFloat(observations[i - 6].value);
     if (!isNaN(value) && !isNaN(oldValue) && oldValue !== 0) {
       const percentChange = ((value - oldValue) / oldValue) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 // Build sorted array from valid change values
 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 // Percentile scores based on change values, not raw values
 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "6M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}

function fetchFRED_CSUSHPISA_6m() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'CSUSHPISA';
 const sheetName = seriesId + "_6m";
 const observationStart = '1994-10-01';
 const invertDirection = true; // true for indicators where higher change value = better economy


 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < observations.length; i++) {
   const value = parseFloat(observations[i].value);
   const date = observations[i].date;


   allDates.push([date]);
   allValues.push([isNaN(value) ? null : Number(value.toFixed(2))]);


   if (i >= 6) {
     const oldValue = parseFloat(observations[i - 6].value);
     if (!isNaN(value) && !isNaN(oldValue) && oldValue !== 0) {
       const percentChange = ((value - oldValue) / oldValue) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 // Build sorted array from valid change values
 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 // Percentile scores based on change values, not raw values
 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "6M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}


function fetchFRED_DGORDER_6m() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'DGORDER';
 const sheetName = seriesId + "_6m";
 const observationStart = '1994-10-01';
 const invertDirection = true; // true for indicators where higher change value = better economy


 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < observations.length; i++) {
   const value = parseFloat(observations[i].value);
   const date = observations[i].date;


   allDates.push([date]);
   allValues.push([isNaN(value) ? null : Number(value.toFixed(2))]);


   if (i >= 6) {
     const oldValue = parseFloat(observations[i - 6].value);
     if (!isNaN(value) && !isNaN(oldValue) && oldValue !== 0) {
       const percentChange = ((value - oldValue) / oldValue) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 // Build sorted array from valid change values
 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 // Percentile scores based on change values, not raw values
 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "6M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}


function fetchFRED_FEDFUNDS() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'FEDFUNDS';
 const sheetName = seriesId;
 const invertDirection = true; // true for indicators where higher value = better economy (e.g., GDP)


 // Pull monthly data starting April 1995 (aggregated to monthly average)
 const observationStart = '1995-04-01';
 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}` +
             `&frequency=m&aggregation_method=avg`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];


 for (let obs of observations) {
   const value = parseFloat(obs.value);
   allDates.push([obs.date]);
   allValues.push([isNaN(value) ? null : value]);
 }


 const validValues = allValues
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validValues].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   // Find first and last occurrence for midpoint tie handling
   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   // Fallback: value falls between two sorted values
   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 const allScores = allValues.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 3).setValues([["Date", "Value", "Percentile Score"]]);


 const displayValues = allValues.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, displayValues.length, 1).setValues(displayValues);
 sheet.getRange(2, 3, allScores.length, 1).setValues(allScores);
}



function fetchFRED_GDPC1_6m() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'GDPC1';
 const sheetName = seriesId + "_6m";
 const observationStart = '1994-10-01';
 const invertDirection = true;


 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 // Expand quarterly data into monthly rows
 const expanded = [];
 for (let i = 0; i < observations.length; i++) {
   const rawDate = observations[i].date;
   const year = parseInt(rawDate.slice(0, 4));
   const month = rawDate.slice(5, 7);
   const value = parseFloat(observations[i].value);
   if (isNaN(value)) continue;


   let months = [];
   if (month === "01") months = ["01", "02", "03"];
   else if (month === "04") months = ["04", "05", "06"];
   else if (month === "07") months = ["07", "08", "09"];
   else if (month === "10") months = ["10", "11", "12"];
   else continue;


   for (let m = 0; m < 3; m++) {
     const fullDate = `${year}-${months[m]}-01`;
     if (fullDate >= "1994-10-01") {
       expanded.push({ date: fullDate, value: value });
     }
   }
 }


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < expanded.length; i++) {
   allDates.push([expanded[i].date]);
   allValues.push([Number(expanded[i].value.toFixed(2))]);


   if (i >= 6) {
     const curr = expanded[i].value;
     const prev = expanded[i - 6].value;
     if (!isNaN(curr) && !isNaN(prev) && prev !== 0) {
       const percentChange = ((curr - prev) / prev) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "6M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}



function fetchFRED_GFDEGDQ188S() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'GFDEGDQ188S';
 const sheetName = seriesId;
 const observationStart = '1995-01-01';
 const invertDirection = false;


 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 // Expand quarterly data into monthly rows
 const expanded = [];
 for (let i = 0; i < observations.length; i++) {
   const dateStr = observations[i].date;
   const year = parseInt(dateStr.substring(0, 4));
   const month = dateStr.substring(5, 7);
   const value = parseFloat(observations[i].value);
   if (isNaN(value)) continue;


   let months = [];
   if (month === "01") months = ["01", "02", "03"];
   else if (month === "04") months = ["04", "05", "06"];
   else if (month === "07") months = ["07", "08", "09"];
   else if (month === "10") months = ["10", "11", "12"];


   for (let m = 0; m < months.length; m++) {
     const formatted = `${year}-${months[m]}-01`;
     if (formatted >= '1995-04-01') {
       expanded.push({ date: formatted, value: value });
     }
   }
 }


 const allDates = expanded.map(entry => [entry.date]);
 const allValues = expanded.map(entry => entry.value);


 const validValues = allValues.filter(v => v !== null && !isNaN(v));
 const sorted = [...validValues].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 const allScores = allValues.map(val => {
   if (val === null || isNaN(val)) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 3).setValues([["Date", "Value", "Percentile Score"]]);


 const displayValues = allValues.map(v => [Number(v.toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, displayValues.length, 1).setValues(displayValues);
 sheet.getRange(2, 3, allScores.length, 1).setValues(allScores);
}



function fetchFRED_GFDEGDQ188S_12m() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'GFDEGDQ188S';
 const sheetName = seriesId + "_12m";
 const observationStart = '1994-01-01';
 const invertDirection = false;


 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 // Expand quarterly data into monthly rows
 const expanded = [];
 for (let i = 0; i < observations.length; i++) {
   const rawDate = observations[i].date;
   const year = parseInt(rawDate.slice(0, 4));
   const month = rawDate.slice(5, 7);
   const value = parseFloat(observations[i].value);
   if (isNaN(value)) continue;


   let months = [];
   if (month === "01") months = ["01", "02", "03"];
   else if (month === "04") months = ["04", "05", "06"];
   else if (month === "07") months = ["07", "08", "09"];
   else if (month === "10") months = ["10", "11", "12"];
   else continue;


   for (let m = 0; m < 3; m++) {
     const fullDate = `${year}-${months[m]}-01`;
     if (fullDate >= "1994-04-01") {
       expanded.push({ date: fullDate, value: value });
     }
   }
 }


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < expanded.length; i++) {
   allDates.push([expanded[i].date]);
   allValues.push([Number(expanded[i].value.toFixed(2))]);


   if (i >= 12) {
     const curr = expanded[i].value;
     const prev = expanded[i - 12].value;
     if (!isNaN(curr) && !isNaN(prev) && prev !== 0) {
       const percentChange = ((curr - prev) / prev) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "12M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}



function fetchFRED_ICSA_6m() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'ICSA';
 const sheetName = seriesId + "_6m";
 const observationStart = '1994-10-01';
 const invertDirection = false; // true for indicators where higher change value = better economy


 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}` +
             `&frequency=m&aggregation_method=avg`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < observations.length; i++) {
   const value = parseFloat(observations[i].value);
   const date = observations[i].date;


   allDates.push([date]);
   allValues.push([isNaN(value) ? null : Number(value.toFixed(2))]);


   if (i >= 6) {
     const oldValue = parseFloat(observations[i - 6].value);
     if (!isNaN(value) && !isNaN(oldValue) && oldValue !== 0) {
       const percentChange = ((value - oldValue) / oldValue) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 // Build sorted array from valid change values
 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 // Percentile scores based on change values, not raw values
 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "6M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}


function fetchFRED_INDPRO_6m() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'INDPRO';
 const sheetName = seriesId + "_6m";
 const observationStart = '1994-10-01';
 const invertDirection = true; // true for indicators where higher change value = better economy


 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < observations.length; i++) {
   const value = parseFloat(observations[i].value);
   const date = observations[i].date;


   allDates.push([date]);
   allValues.push([isNaN(value) ? null : Number(value.toFixed(2))]);


   if (i >= 6) {
     const oldValue = parseFloat(observations[i - 6].value);
     if (!isNaN(value) && !isNaN(oldValue) && oldValue !== 0) {
       const percentChange = ((value - oldValue) / oldValue) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 // Build sorted array from valid change values
 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 // Percentile scores based on change values, not raw values
 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "6M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}



function fetchFRED_NASDAQCOM_6m() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'NASDAQCOM';
 const sheetName = seriesId + "_6m";
 const observationStart = '1994-10-01';
 const invertDirection = true; // true for indicators where higher change value = better economy


 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}` +
             `&frequency=m&aggregation_method=eop`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < observations.length; i++) {
   const value = parseFloat(observations[i].value);
   const date = observations[i].date;


   allDates.push([date]);
   allValues.push([isNaN(value) ? null : Number(value.toFixed(2))]);


   if (i >= 6) {
     const oldValue = parseFloat(observations[i - 6].value);
     if (!isNaN(value) && !isNaN(oldValue) && oldValue !== 0) {
       const percentChange = ((value - oldValue) / oldValue) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 // Build sorted array from valid change values
 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 // Percentile scores based on change values, not raw values
 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "6M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}


function fetchFRED_PERMIT_6m() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'PERMIT';
 const sheetName = seriesId + "_6m";
 const observationStart = '1994-10-01';
 const invertDirection = true; // true for indicators where higher change value = better economy


 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < observations.length; i++) {
   const value = parseFloat(observations[i].value);
   const date = observations[i].date;


   allDates.push([date]);
   allValues.push([isNaN(value) ? null : Number(value.toFixed(2))]);


   if (i >= 6) {
     const oldValue = parseFloat(observations[i - 6].value);
     if (!isNaN(value) && !isNaN(oldValue) && oldValue !== 0) {
       const percentChange = ((value - oldValue) / oldValue) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 // Build sorted array from valid change values
 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 // Percentile scores based on change values, not raw values
 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "6M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}


function fetchFRED_RSXFS_6m() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'RSXFS';
 const sheetName = seriesId + "_6m";
 const invertDirection = true; // true for indicators where higher change value = better economy


 // Pull monthly data starting Oct 1994
 const observationStart = '1994-10-01';
 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}` +
             `&frequency=m&aggregation_method=avg`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < observations.length; i++) {
   const value = parseFloat(observations[i].value);
   const date = observations[i].date;


   allDates.push([date]);
   allValues.push([isNaN(value) ? null : Number(value.toFixed(2))]);


   if (i >= 6) {
     const oldValue = parseFloat(observations[i - 6].value);
     if (!isNaN(value) && !isNaN(oldValue) && oldValue !== 0) {
       const percentChange = ((value - oldValue) / oldValue) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 // Build sorted array from valid change values
 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 // Percentile scores based on change values, not raw values
 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "6M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}


function fetchFRED_T10Y3M() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'T10Y3M';
 const sheetName = seriesId;
 const invertDirection = true; // true for indicators where higher value = better economy (e.g., GDP)


 // Pull monthly data starting April 1995
 const observationStart = '1995-04-01';
 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}` +
             `&frequency=m&aggregation_method=avg`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];


 for (let obs of observations) {
   const value = parseFloat(obs.value);
   allDates.push([obs.date]);
   allValues.push([isNaN(value) ? null : value]);
 }


 const validValues = allValues
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validValues].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   // Find first and last occurrence for midpoint tie handling
   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   // Fallback: value falls between two sorted values
   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 const allScores = allValues.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 3).setValues([["Date", "Value", "Percentile Score"]]);


 const displayValues = allValues.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, displayValues.length, 1).setValues(displayValues);
 sheet.getRange(2, 3, allScores.length, 1).setValues(allScores);
}


function fetchFRED_TOTBKCR_6m() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'TOTBKCR';
 const sheetName = seriesId + "_6m";
 const invertDirection = true; // true for indicators where higher change value = better economy


 // Pull monthly data starting Oct 1994
 const observationStart = '1994-10-01';
 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}` +
             `&frequency=m&aggregation_method=avg`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < observations.length; i++) {
   const value = parseFloat(observations[i].value);
   const date = observations[i].date;


   allDates.push([date]);
   allValues.push([isNaN(value) ? null : Number(value.toFixed(2))]);


   if (i >= 6) {
     const oldValue = parseFloat(observations[i - 6].value);
     if (!isNaN(value) && !isNaN(oldValue) && oldValue !== 0) {
       const percentChange = ((value - oldValue) / oldValue) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 // Build sorted array from valid change values
 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 // Percentile scores based on change values, not raw values
 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "6M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}


function fetchFRED_UMCSENT() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'UMCSENT';
 const sheetName = seriesId;
 const invertDirection = true; // true for indicators where higher value = better economy (e.g., GDP)


 const observationStart = '1995-04-01';
 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];


 for (let obs of observations) {
   const value = parseFloat(obs.value);
   allDates.push([obs.date]);
   allValues.push([isNaN(value) ? null : value]);
 }


 const validValues = allValues
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validValues].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   // Find first and last occurrence for midpoint tie handling
   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   // Fallback: value falls between two sorted values
   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 const allScores = allValues.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 3).setValues([["Date", "Value", "Percentile Score"]]);


 const displayValues = allValues.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, displayValues.length, 1).setValues(displayValues);
 sheet.getRange(2, 3, allScores.length, 1).setValues(allScores);
}


function fetchFRED_UNRATE() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'UNRATE';
 const sheetName = seriesId;
 const invertDirection = false; // true for indicators where higher value = better economy (e.g., GDP)


 const observationStart = '1995-04-01';
 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];


 for (let obs of observations) {
   const value = parseFloat(obs.value);
   allDates.push([obs.date]);
   allValues.push([isNaN(value) ? null : value]);
 }


 const validValues = allValues
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validValues].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   // Find first and last occurrence for midpoint tie handling
   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   // Fallback: value falls between two sorted values
   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 const allScores = allValues.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 3).setValues([["Date", "Value", "Percentile Score"]]);


 const displayValues = allValues.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, displayValues.length, 1).setValues(displayValues);
 sheet.getRange(2, 3, allScores.length, 1).setValues(allScores);
}


function fetchFRED_UNRATE_6M() {
 const apiKey = 'YOUR_FRED_API_KEY_HERE';
 const seriesId = 'UNRATE';
 const sheetName = seriesId + "_6m";
 const invertDirection = false; // true for indicators where higher change value = better economy


 // Pull full monthly data starting Oct 1994
 const observationStart = '1994-10-01';
 const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
             `&api_key=${apiKey}&file_type=json&observation_start=${observationStart}`;


 const response = UrlFetchApp.fetch(url);
 const json = JSON.parse(response.getContentText());
 const observations = json.observations;


 const allDates = [];
 const allValues = [];
 const allChanges = [];


 for (let i = 0; i < observations.length; i++) {
   const value = parseFloat(observations[i].value);
   const date = observations[i].date;


   allDates.push([date]);
   allValues.push([isNaN(value) ? null : Number(value.toFixed(2))]);


   if (i >= 6) {
     const oldValue = parseFloat(observations[i - 6].value);
     if (!isNaN(value) && !isNaN(oldValue) && oldValue !== 0) {
       const percentChange = ((value - oldValue) / oldValue) * 100;
       allChanges.push([percentChange]);
     } else {
       allChanges.push([null]);
     }
   } else {
     allChanges.push([null]);
   }
 }


 // Build sorted array from valid change values
 const validChanges = allChanges
   .filter(v => v[0] !== null)
   .map(v => v[0]);
 const sorted = [...validChanges].sort((a, b) => a - b);
 const n = sorted.length;


 function percentileRank(value) {
   if (n <= 1) return 0;


   let first = -1;
   let last = -1;
   for (let i = 0; i < n; i++) {
     if (sorted[i] === value) {
       if (first === -1) first = i;
       last = i;
     }
   }


   if (first !== -1) {
     const midpoint = (first + last) / 2;
     return (midpoint / (n - 1)) * 100;
   }


   if (value < sorted[0]) return 0;
   if (value > sorted[n - 1]) return 100;


   for (let i = 0; i < n - 1; i++) {
     if (sorted[i] < value && value < sorted[i + 1]) {
       const fraction = (value - sorted[i]) / (sorted[i + 1] - sorted[i]);
       return ((i + fraction) / (n - 1)) * 100;
     }
   }
   return 100;
 }


 // Percentile scores based on change values, not raw values
 const allScores = allChanges.map(v => {
   const val = v[0];
   if (val === null) return [""];
   let score = percentileRank(val);
   if (invertDirection) score = 100 - score;
   return [Number(score.toFixed(2))];
 });


 let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
 if (!sheet) {
   sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
 }
 sheet.clearContents();


 sheet.getRange(1, 1, 1, 4).setValues([["Date", "Value", "6M % Change", "Percentile Score"]]);


 const displayChanges = allChanges.map(v => v[0] === null ? [null] : [Number(v[0].toFixed(2))]);


 sheet.getRange(2, 1, allDates.length, 1).setValues(allDates);
 sheet.getRange(2, 2, allValues.length, 1).setValues(allValues);
 sheet.getRange(2, 3, displayChanges.length, 1).setValues(displayChanges);
 sheet.getRange(2, 4, allScores.length, 1).setValues(allScores);
}


function runCorrelationMatrix() {
 const ss = SpreadsheetApp.getActiveSpreadsheet();


 // [tabName, col (1-based), startRow, displayName, lagMonths]
 const indicators = [
   ['UNRATE',                    2, 2,  'Unemployment Rate',           0],
   ['AWHMAN',                    2, 2,  'Avg Weekly Hrs (Mfg)',        0],
   ['BAMLH0A0HYM2',              2, 2,  'High-Yield Spread',           0],
   ['BAA10Y',                    2, 2,  'Corporate Bond Spread',       0],
   ['T10Y3M',                    2, 2,  'Yield Curve',                 0],
   ['FEDFUNDS',                  2, 2,  'Fed Funds Rate',              0],
   ['UMCSENT',                   2, 2,  'Consumer Sentiment',          0],
   ['GFDEGDQ188S',               2, 2,  'Total Debt % GDP',            3],
   ['UNRATE_6m',                 3, 8,  'Unemployment Rate (6m%)',     0],
   ['ICSA_6M',                   3, 8,  'Jobless Claims (6m%)',        0],
   ['TOTBKCR_6m',                3, 8,  'Bank Credit (6m%)',           0],
   ['CPIAUCSL_6m',               3, 8,  'CPI (6m%)',                   0],
   ['RSXFS_6m',                  3, 8,  'Retail Sales (6m%)',          0],
   ['INDPRO_6m',                 3, 8,  'Industrial Production (6m%)', 0],
   ['AMTMNO_6m',                 3, 8,  'Mfg New Orders (6m%)',        1],
   ['DGORDER_6m',                3, 8,  'Durable Goods (6m%)',         1],
   ['PERMIT_6m',                 3, 8,  'Building Permits (6m%)',      0],
   ['CSUSHPISA_6m',              3, 8,  'Home Price Index (6m%)',      2],
   ['NASDAQCOM_6m',              3, 8,  'NASDAQ (6m%)',                0],
   ['GDPC1_6m',                  3, 8,  'Real GDP (6m%)',              3],
   ['SP500_6m_Not_Automated',    3, 8,  'S&P 500 (6m%)',               0],
   ['DowJones_6m_Not_Automated', 3, 8,  'Dow Jones (6m%)',             0],
   ['GFDEGDQ188S_12m',           3, 14, 'Debt % GDP (1yr%)',           3],
 ];


 function shiftMonth(yyyyMM, months) {
   const [y, m] = yyyyMM.split('-').map(Number);
   const total = y * 12 + (m - 1) + months;
   const newY = Math.floor(total / 12);
   const newM = (total % 12) + 1;
   return newY + '-' + String(newM).padStart(2, '0');
 }


 function loadData(tabName, col, startRow, lagMonths) {
   const sheet = ss.getSheetByName(tabName);
   if (!sheet) { Logger.log('Tab not found: ' + tabName); return {}; }
   const lastRow = sheet.getLastRow();
   if (lastRow < startRow) return {};
   const nRows = lastRow - startRow + 1;
   const dates = sheet.getRange(startRow, 1, nRows, 1).getValues();
   const vals  = sheet.getRange(startRow, col, nRows, 1).getValues();
   const data  = {};
   for (let i = 0; i < nRows; i++) {
     const d = dates[i][0];
     const v = vals[i][0];
     if (!d || v === '' || v === null || typeof v !== 'number') continue;
     const key = Utilities.formatDate(new Date(d), 'UTC', 'yyyy-MM');
     const shiftedKey = lagMonths > 0 ? shiftMonth(key, lagMonths) : key;
     data[shiftedKey] = v;
   }
   return data;
 }


 function pearson(a, b) {
   const n = a.length;
   const ma = a.reduce((s, v) => s + v, 0) / n;
   const mb = b.reduce((s, v) => s + v, 0) / n;
   let num = 0, da2 = 0, db2 = 0;
   for (let i = 0; i < n; i++) {
     const da = a[i] - ma, db = b[i] - mb;
     num += da * db; da2 += da * da; db2 += db * db;
   }
   return (da2 === 0 || db2 === 0) ? 0 : num / Math.sqrt(da2 * db2);
 }


 function writeMatrix(sheetName, subset, afterDate) {
   const dataMaps = subset.map(([tabName, col, startRow, name, lagMonths]) => ({
     name,
     data: (() => {
       const raw = loadData(tabName, col, startRow, lagMonths);
       const filtered = {};
       Object.keys(raw).forEach(k => { if (k >= afterDate) filtered[k] = raw[k]; });
       return filtered;
     })()
   }));


   let common = Object.keys(dataMaps[0].data);
   for (let i = 1; i < dataMaps.length; i++) {
     const keys = new Set(Object.keys(dataMaps[i].data));
     common = common.filter(k => keys.has(k));
   }
   common.sort();
   Logger.log(sheetName + ': ' + common.length + ' common months');


   const arrays = dataMaps.map(({ data }) => common.map(k => data[k]));
   const n = dataMaps.length;
   const matrix = Array.from({length: n}, (_, i) =>
     Array.from({length: n}, (_, j) => pearson(arrays[i], arrays[j]))
   );
   const names = dataMaps.map(d => d.name);


   let out = ss.getSheetByName(sheetName);
   if (out) ss.deleteSheet(out);
   out = ss.insertSheet(sheetName);


   out.getRange(1, 1, 1, n + 1).setValues([[common.length + ' months (' + common[0] + ' to ' + common[common.length-1] + ')', ...names]]);
   for (let i = 0; i < n; i++) {
     out.getRange(i + 2, 1, 1, n + 1).setValues([[names[i], ...matrix[i].map(v => parseFloat(v.toFixed(2)))]]);
   }
   for (let i = 0; i < n; i++) {
     for (let j = 0; j < n; j++) {
       if (i !== j && Math.abs(matrix[i][j]) > 0.85) {
         out.getRange(i + 2, j + 2).setBackground('#ff9999');
       }
     }
   }
   out.getRange(1, 1, 1, n + 1).setFontWeight('bold');
   out.getRange(1, 1, n + 1, 1).setFontWeight('bold');
   out.setFrozenRows(1);
   out.setFrozenColumns(1);
 }


 writeMatrix('Correlation Matrix (All 23)', indicators, '1997-01');


 SpreadsheetApp.getUi().alert(
   'Done!\n' +
   '• All 23 indicators (1997–present)\n' +
   '• Quarterly indicators lagged 3 months\n' +
   '• Home Price Index lagged 2 months\n' +
   '• Mfg New Orders & Durable Goods lagged 1 month\n' +
   'Red = |r| > 0.85'
 );
}



