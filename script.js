const database = {
  selectors: {
    continent: 'world',
    case: 'all',
    country: 'all',
  },
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

const ctx = document.getElementById('chart');
const covidChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Deaths',
            borderColor: 'rgb(255, 60, 80)',
            pointBackgroundColor: '#e6e6e6',
            pointHoverBackgroundColor: 'rgb(255, 60, 80)',
            pointBorderWidth: 2,
            borderWidth: 2,
            borderJoinStyle: 'round',
            spanGaps: true,
            data: []
        },{
            label: 'Critical',
            borderColor: 'rgb(232, 176, 44)',
            pointBackgroundColor: '#e6e6e6',
            pointHoverBackgroundColor: 'rgb(232, 176, 44)',
            pointBorderWidth: 2,
            borderWidth: 2,
            borderJoinStyle: 'round',
            spanGaps: true,
            data: []
        },{
            label: 'Confirmed',
            borderColor: 'rgb(84, 217, 235)',
            pointBackgroundColor: '#e6e6e6',
            pointHoverBackgroundColor: 'rgb(84, 217, 235)',
            pointBorderWidth: 2,
            borderWidth: 2,
            borderJoinStyle: 'round',
            spanGaps: true,
            data: []
        },{
            label: 'Recovered',
            borderColor: 'rgb(45, 255, 8)',
            pointBackgroundColor: '#e6e6e6',
            pointHoverBackgroundColor: 'rgb(45, 255, 8)',
            pointBorderWidth: 2,
            borderWidth: 2,
            borderJoinStyle: 'round',
            spanGaps: true,
            data: []
        }]
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
            mode: 'point'
        },
      legend: {
        align: 'center',
        labels: {
          boxWidth: 15,
          padding: 15,
        }
      }
    }
});

const fetchData = async (url) => {
  const data = await fetch(url, {mode: 'cors'});
  if (!data.ok) throw new Error(`Status Code Error: ${response.status}`);
  return data.json();
};

const sortCountries = async (data) => {
  const countriesList = await data;
  countriesList.map(obj => {
    const region = obj.region.toLowerCase();
    region && region !== 'oceania' ? database.countries[region][obj.cca2] = {name: obj.name.common} : '';
  });
  return sortCovid(fetchData(database.apis.covidAPI))
};

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
  dropdownCountries(database.selectors.continent);
  updateChart();
};

const dropdownCountries = (continent) => {
  const dropdown = document.querySelector('#country-select');
  const baseHTML = `<option value="" disabled selected>Select Country</option>
          <option value="all">All</option>`;
  dropdown.innerHTML = baseHTML;
  if (continent !== 'world') {
    const obj = database.countries[continent];
    for (const key in obj) {
      const current = document.createElement('option');
      current.setAttribute('value',key);
      current.innerText = obj[key].name;
      dropdown.appendChild(current);
    }
  } else {
    const continents = database.countries;
      for (const region in continents) {
        for (const country in continents[region]) {
          const current = document.createElement('option');
          current.setAttribute('value',country);
          current.innerText = continents[region][country].name;
          dropdown.appendChild(current);
        }
      }
  }
};

const removeChart = () => {
  const length = covidChart.data.labels.length;
    for (let i = 0; i < length;i++) {
      covidChart.data.labels.pop();
      covidChart.data.datasets.forEach((dataset) => {
          dataset.data.pop();
      });
    }
    covidChart.update();
};

const updateChart = () => {
  removeChart();
  const graphContainer = document.querySelector('.graph-container').classList;
  // if ([...graphContainer].includes('hidden')) {
  //   setTimeout(() => graphContainer.remove('hidden'), 4000)
  // }
  
  // document.querySelector('.graph-container').classList.remove('hidden');
    const type = database.selectors.case;
    const length = covidChart.data.labels.length;
    const continent = database.selectors.continent;
    const typesIndex = ['deaths','critical','confirmed','recovered'];
    const index = typesIndex.indexOf(type);
    if (continent === 'world') {
      const continents = database.countries;
      let counter = 0;
      for (const region in continents) {
        for (const country in continents[region]) {
          covidChart.data.labels.push(continents[region][country].name);
          if (type === 'all') {
            covidChart.data.datasets[0].data.push(continents[region][country].deaths);
            covidChart.data.datasets[1].data.push(continents[region][country].critical);
            covidChart.data.datasets[2].data.push(continents[region][country].confirmed);
            covidChart.data.datasets[3].data.push(continents[region][country].recovered);
          } else {
            covidChart.data.datasets[index].data.push(continents[region][country][type]);
          }
        }
        covidChart.update(400);
      }
    } else {
        const obj = database.countries[continent];
        for (const key in obj) {
          covidChart.data.labels.push(obj[key].name);
          if (type === 'all') {
            covidChart.data.datasets[0].data.push(obj[key].deaths);
            covidChart.data.datasets[1].data.push(obj[key].critical);
            covidChart.data.datasets[2].data.push(obj[key].confirmed);
            covidChart.data.datasets[3].data.push(obj[key].recovered);
          } else {
            covidChart.data.datasets[index].data.push(obj[key][type])
          }
          covidChart.update(400);
        }
    }
    [...graphContainer].includes('hidden') ? graphContainer.remove('hidden') : '';
};

const chartOneCountry = async () => {
  removeChart();
  console.log(database.selectors.country);
  const url = `${database.apis.covidAPI}/${database.selectors.country}`;
  const countryData = await fetchData(url);
  const timeline = countryData.data.timeline;
  console.log(countryData.data.timeline);
  const typesIndex = ['deaths','critical','confirmed','recovered'];
  const type = database.selectors.case;
  const index = typesIndex.indexOf(type);
  for (let i = timeline.length-1; i > 0; i-=14) {
    covidChart.data.labels.push(timeline[i].date);
    if (type === 'all') {
            covidChart.data.datasets[0].data.push(timeline[i].deaths);
            covidChart.data.datasets[1].data.push(timeline[i].critical);
            covidChart.data.datasets[2].data.push(timeline[i].confirmed);
            covidChart.data.datasets[3].data.push(timeline[i].recovered);
    } else {
        covidChart.data.datasets[index].data.push(timeline[i][type]);
      }
    covidChart.update(400);
  }
};

sortCountries(fetchData(database.apis.countriesAPI));
Chart.defaults.global.defaultFontColor = '#e6e6e6';
// Chart.defaults.global.animation.duration = '2000';

const continentSelectors = document.querySelectorAll('[type="radio"][name="continent"]');
continentSelectors.forEach(e => {
  e.addEventListener('change', (e) => {
    database.selectors.country = 'all';
    database.selectors.continent = e.target.getAttribute('id');
    console.log(e.target.getAttribute('id'));
    dropdownCountries(database.selectors.continent);
  })
});

const caseSelectors = document.querySelectorAll('[type="radio"][name="case"]');
caseSelectors.forEach(e => {
  e.addEventListener('change', (e) => {
    database.selectors.case = e.target.getAttribute('id');
    console.log(e.target.getAttribute('id'));
  })
});

const countrySelector = document.querySelector('select');
countrySelector.addEventListener('click', (e) => {
  database.selectors.country = e.target.value;
});

const viewGraphButton = document.querySelector('.graph-btn');
viewGraphButton.addEventListener('click', () => {
  database.selectors.country === 'all' || database.selectors.country === "" ? updateChart() : chartOneCountry();
});
