const database = {
  apis: {
    covidAPI: 'https://corona-api.com/countries',
    countriesAPI: 'https://cors.bridged.cc/https://restcountries.herokuapp.com/api/v1/',
  },
  countries: {
    asia: {},
    europe: {},
    africa: {},
    americas: {},
  }
}


const fetchData = async (url) => {
  const data = await fetch(url, {mode: 'cors'});
  if (!data.ok) throw new Error(`Status Code Error: ${response.status}`);
  return data.json();
}

const sortCountries = async (data) => {
  const countriesList = await data;
  countriesList.map(obj => {
    const region = obj.region.toLowerCase();
    region && region !== 'oceania' ? database.countries[region][obj.cca2] = {name: obj.name.common} : '';
  });
  return sortCovid(fetchData(database.apis.covidAPI))
}

const sortCovid = async (data) => {
  const covidData = await data;
  const db = database.countries;
  for (const continent in db) {
    for (const country in db[continent]) {
      covidData.data.map(obj => {
        if (country === obj.code) {
          db[continent][country].deaths = obj.latest_data.deaths;
          db[continent][country].critical = obj.latest_data.critical;
          db[continent][country].confirmed = obj.latest_data.confirmed;
          db[continent][country].recovered = obj.latest_data.recovered;
        }
      })
    }
  }
  console.log('I Finished');
}

// const ctx = document.getElementById('chart');
// const covidChart = new Chart(ctx, {
//     type: 'line',
//     data: {
//         labels: [],
//         datasets: [{
//             label: 'TEST',
//             backgroundColor: 'rgba(255, 99, 132,.3)',
//             borderColor: 'rgb(255, 99, 132)',
//             data: []
//         }]
//     },
//     options: {}
// });

const updateChart = (continent = 'asia',type = 'deaths') => {
    const length = covidChart.data.labels.length;
    for (let i = 0; i < length;i++) {
      covidChart.data.labels.pop();
      covidChart.data.datasets.forEach((dataset) => {
          dataset.data.pop();
      });
    }
    covidChart.update();
    covidChart.data.datasets[0].label = `${type} in ${continent}`;
    const obj = database.countries[continent];
    for (const key in obj) {
      covidChart.data.labels.push(obj[key].name);
      covidChart.data.datasets.forEach((dataset) => {
          dataset.data.push(obj[key][type]);
      });
    }
    covidChart.update();
}

sortCountries(fetchData(database.apis.countriesAPI));
