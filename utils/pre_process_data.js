/** used for preprocessing data
 * @param  data
 */
class PreprocessData {
  constructor(data, selectedYear) {
    // for normal CSVs
    this.data = data;

    // For CSVs that need format
    // this.data = this.format_dataset(data);

    this.selectedYear = selectedYear;
   
  }

  format_dataset(input) {
    console.log("DATA ", input);

    const transformdata = {};
    const yearsSet = new Set();
    const codes = {};

    // Parse the input data
    input.forEach((item) => {
      const {
        Entity: country,
        Code: code,
        Year: year,
        "GDP per capita": gdp,
      } = item;

      if (!transformdata[country]) {
        transformdata[country] = {};
      }
      if (!codes[country]) {
        codes[country] = code;
      }

      transformdata[country][year] = gdp || "0";
      if (parseInt(year) >= 1980) {
        yearsSet.add(year);
      }
    });

    // Get sorted list of years from 1998 onwards
    const headerYears = Array.from(yearsSet).sort((a, b) => a - b);

    // Build the JSON array output
    const output = [];

    Object.keys(transformdata).forEach((country) => {
      const countryData = {
        Country: country,
        Code: codes[country],
        Continent: this.getContinentByCountry(country), 
      };
      headerYears.forEach((year) => {
        countryData[year] = transformdata[country][year] || "0";
      });
      output.push(countryData);
    });

    console.log(JSON.stringify(output, null, 2));
    return output;

  }


  saveStringToCsv(string) {
    var csv = string.replace(/\r\n|\n|\r/g, "\n");
    var blob = new Blob([csv], { type: "text/csv" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }


  /** Get continent based on the country name */  
  getContinentByCountry(country) {  
      const countryToContinentMap =
      {
        "Afghanistan": "Asia",
        "Albania": "Europe",
        "Algeria": "Africa",
        "Andorra": "Europe",
        "Angola": "Africa",
        "Antigua and Barbuda": "North America",
        "Argentina": "South America",
        "Armenia": "Asia",
        "Australia": "Oceania",
        "Austria": "Europe",
        "Azerbaijan": "Asia",
        "Bahamas": "North America",
        "Bahrain": "Asia",
        "Bangladesh": "Asia",
        "Barbados": "North America",
        "Belarus": "Europe",
        "Belgium": "Europe",
        "Belize": "North America",
        "Benin": "Africa",
        "Bhutan": "Asia",
        "Bolivia": "South America",
        "Bosnia and Herzegovina": "Europe",
        "Botswana": "Africa",
        "Brazil": "South America",
        "Brunei": "Asia",
        "Bulgaria": "Europe",
        "Burkina Faso": "Africa",
        "Burundi": "Africa",
        "Cape Verde": "Africa",
        "Cambodia": "Asia",
        "Cameroon": "Africa",
        "Canada": "North America",
        "Central African Republic": "Africa",
        "Chad": "Africa",
        "Chile": "South America",
        "China": "Asia",
        "Colombia": "South America",
        "Comoros": "Africa",
        "Democratic Republic of Congo": "Africa",
        "Congo": "Africa",
        "Costa Rica": "North America",
        "Cote d'Ivoire": "Africa",
        "Croatia": "Europe",
        "Cuba": "North America",
        "Cyprus": "Asia",
        "Czechia": "Europe",
        "Czechoslovakia":"Europe",
        "Denmark": "Europe",
        "Djibouti": "Africa",
        "Dominica": "North America",
        "Dominican Republic": "North America",
        "East Timor (Timor-Leste)": "Asia",
        "East Asia (MPD)":"Asia",
        "Eastern Europe (MPD)":"Europe",
        "Former Sudan":"Africa",
        "Ecuador": "South America",
        "Egypt": "Africa",
        "El Salvador": "North America",
        "Equatorial Guinea": "Africa",
        "Eritrea": "Africa",
        "Estonia": "Europe",
        "Eswatini": "Africa",
        "Ethiopia": "Africa",
        "Fiji": "Oceania",
        "Finland": "Europe",
        "France": "Europe",
        "Gabon": "Africa",
        "Gambia": "Africa",
        "Georgia": "Asia",
        "Germany": "Europe",
        "Ghana": "Africa",
        "Greece": "Europe",
        "Grenada": "North America",
        "Guatemala": "North America",
        "Guinea": "Africa",
        "Guinea-Bissau": "Africa",
        "Guyana": "South America",
        "Haiti": "North America",
        "Hong Kong":"Asia",
        "Honduras": "North America",
        "Hungary": "Europe",
        "Myanmar":"Asia",
        "Iceland": "Europe",
        "India": "Asia",
        "Indonesia": "Asia",
        "Iran": "Asia",
        "Iraq": "Asia",
        "Ireland": "Europe",
        "Israel": "Asia",
        "Italy": "Europe",
        "Jamaica": "North America",
        "Japan": "Asia",
        "Jordan": "Asia",
        "Kazakhstan": "Asia",
        "Kenya": "Africa",
        "Kiribati": "Oceania",
        "Korea, North": "Asia",
        "Korea, South": "Asia",
        "Kosovo": "Europe",
        "Kuwait": "Asia",
        "Kyrgyzstan": "Asia",
        "Laos": "Asia",
        "Latvia": "Europe",
        "Lebanon": "Asia",
        "Lesotho": "Africa",
        "Liberia": "Africa",
        "Libya": "Africa",
        "Liechtenstein": "Europe",
        "Lithuania": "Europe",
        "Luxembourg": "Europe",
        "Madagascar": "Africa",
        "Malawi": "Africa",
        "Malaysia": "Asia",
        "Maldives": "Asia",
        "Mali": "Africa",
        "Malta": "Europe",
        "Marshall Islands": "Oceania",
        "Mauritania": "Africa",
        "Mauritius": "Africa",
        "Mexico": "North America",
        "Micronesia, Federated States of": "Oceania",
        "Moldova": "Europe",
        "Monaco": "Europe",
        "Mongolia": "Asia",
        "Montenegro": "Europe",
        "Morocco": "Africa",
        "Mozambique": "Africa",
        "Myanmar (Burma)": "Asia",
        "Namibia": "Africa",
        "Nauru": "Oceania",
        "Nepal": "Asia",
        "Netherlands": "Europe",
        "North Korea":"Asia",
        "New Zealand": "Oceania",
        "Nicaragua": "North America",
        "Niger": "Africa",
        "Nigeria": "Africa",
        "North Macedonia": "Europe",
        "Norway": "Europe",
        "Oman": "Asia",
        "Pakistan": "Asia",
        "Palau": "Oceania",
        "Panama": "North America",
        "Papua New Guinea": "Oceania",
        "Paraguay": "South America",
        "Peru": "South America",
        "Palestine":"Asia",
        "Puerto Rico":"North America",
        "Philippines": "Asia",
        "Poland": "Europe",
        "Portugal": "Europe",
        "Qatar": "Asia",
        "Romania": "Europe",
        "Russia": "Europe",
        "Rwanda": "Africa",
        "Saint Kitts and Nevis": "North America",
        "Saint Lucia": "North America",
        "Saint Vincent and the Grenadines": "North America",
        "Samoa": "Oceania",
        "San Marino": "Europe",
        "Sao Tome and Principe": "Africa",
        "Saudi Arabia": "Asia",
        "Senegal": "Africa",
        "Serbia": "Europe",
        "Seychelles": "Africa",
        "Sierra Leone": "Africa",
        "Singapore": "Asia",
        "Slovakia": "Europe",
        "Slovenia": "Europe",
        "Solomon Islands": "Oceania",
        "Somalia": "Africa",
        "South Africa": "Africa",
        "South Sudan": "Africa",
        "South Korea":"Asia",
        'South and South East Asia (MPD)':"Asia",
        "Sub Saharan Africa (MPD)":"Africa",
        "Spain": "Europe",
        "Sri Lanka": "Asia",
        "Sudan": "Africa",
        "Suriname": "South America",
        "Sweden": "Europe",
        "Switzerland": "Europe",
        "Syria": "Asia",
        "Taiwan": "Asia",
        "Tajikistan": "Asia",
        "Tanzania": "Africa",
        "Thailand": "Asia",
        "Togo": "Africa",
        "Tonga": "Oceania",
        "Trinidad and Tobago": "North America",
        "Tunisia": "Africa",
        "Turkey": "Asia",
        "Turkmenistan": "Asia",
        "Tuvalu": "Oceania",
        "Uganda": "Africa",
        "Ukraine": "Europe",
        "United Arab Emirates": "Asia",
        "United Kingdom": "Europe",
        "United States": "North America",
        "Uruguay": "South America",
        "Uzbekistan": "Asia",
        "Vanuatu": "Oceania",
        "Vatican City": "Europe",
        "Venezuela": "South America",
        "Western Europe (MPD)":"Europe",
        "Vietnam": "Asia",
        "Yemen": "Asia",
        "Zambia": "Africa",
        "Zimbabwe": "Africa"
      }
      

      return countryToContinentMap[country] || "Unknown";  
  }  

   /** modify the data and add countries by continents */  
  addContinentBasedOnCountry(data) { 

     data = data.map((item) => ({  
        ...item,  
        Continent: this.getContinentByCountry(item.Country),  
    }));  

    console.log("data",data)

    return data;

} 
  //return map name with country id
  get_country() {
    return {
      "004": "Afghanistan",
      "008": "Albania",
      "012": "Algeria",
      "016": "American Samoa",
      "020": "Andorra",
      "024": "Angola",
      660: "Anguilla",
      "010": "Antarctica",
      "028": "Antigua and Barbuda",
      "032": "Argentina",
      "051": "Armenia",
      533: "Aruba",
      "036": "Australia",
      "040": "Austria",
      "031": "Azerbaijan",
      "044": "Bahamas",
      "048": "Bahrain",
      "050": "Bangladesh",
      "052": "Barbados",
      112: "Belarus",
      "056": "Belgium",
      "084": "Belize",
      204: "Benin",
      "060": "Bermuda",
      "064": "Bhutan",
      "068": "Bolivia",
      "070": "Bosnia and Herzegovina",
      "072": "Botswana",
      "074": "Bouvet Island",
      "076": "Brazil",
      "086": "British Indian Ocean Territory",
      "096": "Brunei Darussalam",
      100: "Bulgaria",
      854: "Burkina Faso",
      108: "Burundi",
      116: "Cambodia",
      120: "Cameroon",
      124: "Canada",
      132: "Cape Verde",
      136: "Cayman Islands",
      140: "Central African Republic",
      148: "Chad",
      152: "Chile",
      156: "China",
      162: "Christmas Island",
      166: "Cocos (Keeling) Islands",
      170: "Colombia",
      174: "Comoros",
      178: "Democratic Republic of Congo",
      180: "Democratic Republic of Congo",
      184: "Cook Islands",
      188: "Costa Rica",
      384: "Cote d'Ivoire",
      191: "Croatia",
      192: "Cuba",
      196: "Cyprus",
      203: "Czechia",
      208: "Denmark",
      262: "Djibouti",
      212: "Dominica",
      214: "Dominican Republic",
      218: "Ecuador",
      818: "Egypt",
      222: "El Salvador",
      226: "Equatorial Guinea",
      232: "Eritrea",
      233: "Estonia",
      748: "Eswatini",
      231: "Ethiopia",
      238: "Falkland Islands (Malvinas)",
      234: "Faroe Islands",
      242: "Fiji",
      246: "Finland",
      250: "France",
      254: "French Guiana",
      258: "French Polynesia",
      260: "French Southern Territories",
      266: "Gabon",
      270: "Gambia",
      268: "Georgia",
      276: "Germany",
      288: "Ghana",
      292: "Gibraltar",
      300: "Greece",
      304: "Greenland",
      308: "Grenada",
      312: "Guadeloupe",
      316: "Guam",
      320: "Guatemala",
      324: "Guinea",
      624: "Guinea-Bissau",
      328: "Guyana",
      332: "Haiti",
      334: "Heard Island and McDonald Islands",
      336: "Holy See (Vatican City State)",
      340: "Honduras",
      344: "Hong Kong",
      348: "Hungary",
      352: "Iceland",
      356: "India",
      360: "Indonesia",
      364: "Iran, Islamic Republic of",
      368: "Iraq",
      372: "Ireland",
      376: "Israel",
      380: "Italy",
      388: "Jamaica",
      392: "Japan",
      400: "Jordan",
      398: "Kazakhstan",
      404: "Kenya",
      296: "Kiribati",
      408: "South Korea",
      410: "North Korea",
      414: "Kuwait",
      417: "Kyrgyzstan",
      418: "Lao People's Democratic Republic",
      428: "Latvia",
      422: "Lebanon",
      426: "Lesotho",
      430: "Liberia",
      434: "Libya",
      438: "Liechtenstein",
      440: "Lithuania",
      442: "Luxembourg",
      446: "Macao",
      450: "Madagascar",
      454: "Malawi",
      458: "Malaysia",
      462: "Maldives",
      466: "Mali",
      470: "Malta",
      584: "Marshall Islands",
      474: "Martinique",
      478: "Mauritania",
      480: "Mauritius",
      175: "Mayotte",
      484: "Mexico",
      583: "Micronesia, Federated States of",
      498: "Moldova, Republic of",
      492: "Monaco",
      496: "Mongolia",
      499: "Montenegro",
      500: "Montserrat",
      504: "Morocco",
      508: "Mozambique",
      104: "Myanmar",
      516: "Namibia",
      520: "Nauru",
      524: "Nepal",
      528: "Netherlands",
      540: "New Caledonia",
      554: "New Zealand",
      558: "Nicaragua",
      562: "Niger",
      566: "Nigeria",
      570: "Niue",
      574: "Norfolk Island",
      580: "Northern Mariana Islands",
      578: "Norway",
      512: "Oman",
      586: "Pakistan",
      585: "Palau",
      275: "Palestine, State of",
      591: "Panama",
      598: "Papua New Guinea",
      600: "Paraguay",
      604: "Peru",
      608: "Philippines",
      612: "Pitcairn",
      616: "Poland",
      620: "Portugal",
      630: "Puerto Rico",
      634: "Qatar",
      642: "Romania",
      643: "Russia",
      646: "Rwanda",
      652: "Saint Barthélemy",
      654: "Saint Helena, Ascension and Tristan da Cunha",
      659: "Saint Kitts and Nevis",
      662: "Saint Lucia",
      663: "Saint Martin (French part)",
      666: "Saint Pierre and Miquelon",
      670: "Saint Vincent and the Grenadines",
      882: "Samoa",
      674: "San Marino",
      678: "Sao Tome and Principe",
      682: "Saudi Arabia",
      686: "Senegal",
      688: "Serbia",
      690: "Seychelles",
      694: "Sierra Leone",
      702: "Singapore",
      534: "Sint Maarten (Dutch part)",
      703: "Slovakia",
      705: "Slovenia",
      "090": "Solomon Islands",
      706: "Somalia",
      710: "South Africa",
      239: "South Georgia and the South Sandwich Islands",
      728: "South Sudan",
      724: "Spain",
      144: "Sri Lanka",
      729: "Sudan",
      740: "Suriname",
      744: "Svalbard and Jan Mayen",
      748: "Eswatini",
      752: "Sweden",
      756: "Switzerland",
      760: "Syrian Arab Republic",
      158: "Taiwan, Province of China",
      762: "Tajikistan",
      834: "Tanzania, United Republic of",
      764: "Thailand",
      626: "Timor-Leste",
      768: "Togo",
      772: "Tokelau",
      776: "Tonga",
      780: "Trinidad and Tobago",
      788: "Tunisia",
      792: "Turkey",
      795: "Turkmenistan",
      796: "Turks and Caicos Islands",
      798: "Tuvalu",
      800: "Uganda",
      804: "Ukraine",
      784: "United Arab Emirates",
      826: "United Kingdom",
      840: "United States",
      581: "United States Minor Outlying Islands",
      858: "Uruguay",
      860: "Uzbekistan",
      548: "Vanuatu",
      862: "Venezuela, Bolivarian Republic of",
      704: "Viet Nam",
      "092": "Virgin Islands, British",
      850: "Virgin Islands, U.S.",
      876: "Wallis and Futuna",
      732: "Western Sahara",
      887: "Yemen",
      894: "Zambia",
      716: "Zimbabwe",
    };
  }

  populateFilterWithYear() {
    var filter = document.getElementById("yearFilter");

    filter.innerHTML = "";

    var startYear = 1980;
    var endYear = new Date().getFullYear();

    for (var year = startYear; year <= endYear; year++) {
      var option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      filter.appendChild(option);
    }
  }

  top10CountryHighestGdp() {
    console.log("selected year", this.selectedYear);
     // Sort the data in descending order based on the "2022" attribute
    this.data = this.data.sort(
      (a, b) => b[this.selectedYear] - a[this.selectedYear]
    );

    // Get the top 10 highest values
    const top10 = this.data.slice(0, 10);

    return top10;
  }

  mapGpdWithId(countryname, data) {
    var filter = data.filter((country) => country.country === countryname);
    console.log("filter", filter);
    return filter;
  }

  /** calculate correlation coefficient */
  calculateCorrelation(data1, data2) {
    if (data1.length !== data2.length) {
      throw new Error("Input arrays must have the same length");
    }

    const n = data1.length;

    // Calculate the mean of each dataset
    const mean1 = data1.reduce((acc, val) => acc + val, 0) / n;
    const mean2 = data2.reduce((acc, val) => acc + val, 0) / n;

    // Calculate the sum of the products of the differences from the mean
    let covariance = 0;
    let variance1 = 0;
    let variance2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = data1[i] - mean1;
      const diff2 = data2[i] - mean2;

      covariance += diff1 * diff2;
      variance1 += diff1 * diff1;
      variance2 += diff2 * diff2;
    }

    // Calculate the correlation coefficient
    const correlation = covariance / Math.sqrt(variance1 * variance2);

    return correlation;
  }
}
