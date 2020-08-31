const BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall';
let API_KEY;
const APIKEY_KEY = 'API_KEY';
const LOCATIONS_KEY = 'locations';
const FORECASTS_KEY = 'forecasts';
const SETTINGS_KEY = 'settings';


class ApplicationSettings {
  constructor() {
    this.load()
  }

  load() {
    const storage = window.localStorage;
    this.locations = JSON.parse(storage.getItem(LOCATIONS_KEY)) || [];
    this.apiKeys = JSON.parse(storage.getItem(APIKEY_KEY)) || {
      weatherKey: {
        key: '',
        valid: false
      },
      locationKey: {
        key: '',
        valid: false
      }
    };
    this.forecasts = JSON.parse(storage.getItem(FORECASTS_KEY)) || {};
    for (let key in this.forecasts) {
      this.forecasts[key] = new WeatherForecast(this.forecasts[key], false);
    }
    this.settings = JSON.parse(storage.getItem(SETTINGS_KEY)) || {
      units: 'metric'
    };
  }

  save() {
    const storage = window.localStorage;
    storage.setItem(LOCATIONS_KEY, JSON.stringify(this.locations));
    storage.setItem(APIKEY_KEY, JSON.stringify(this.apiKeys));
    storage.setItem(FORECASTS_KEY, JSON.stringify(this.forecasts));
    storage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
  }

  getMiscSettings(field) {
    if (!field) {
      return this.settings;
    }
    return this.settings[field];
  }

  setMiscSettings(field, fieldValue) {
    this.settings[field] = fieldValue;
    return this;
  }

  //**************************************************************************
  // this.locations

  /**
   * Searches available cities by city names
   * @param {string} cityName 
   * @returns {number} the location cityIndex if found, -1 else.
   */
  findLocationByCity(cityName) {
    return this.locations.findIndex(loc => {
      if (loc.cityName.toLowerCase() === cityName.toLowerCase()) {
        return true;
      }
      return false;
    });
  }
  /**
   * Searches available cities by coordinates
   * @param {number} longitude
   * @param {number} latitude
   * @returns {number} the location cityIndex if found, -1 else.
   */
  findLocationByCoords(longitude, latitude) {
    return this.locations.findIndex(loc => {
      // Search by coordinates
      if (loc.longitude === longitude && loc.latitude === latitude) {
        return true;
      }
      return false;
    });
  }

  /**
   * Return the location data by its index
   * @param {number} index 
   */
  getLocation(index) {
    return this.locations[index];
  }

  /**
   * Set the location data at specified index
   * @param {number} index
   * @param {object} location 
   */
  setLocation(index, location) {
    const newLocation = {
      cityName: location.cityName,
      longitude: location.longitude,
      latitude: location.latitude
    };
    this.locations[index] = newLocation;
  }

  /**
   * Add a new location
   * @param {object} location 
   */
  addLocation(location) {
    const newLocation = {
      cityName: location.cityName,
      longitude: location.longitude,
      latitude: location.latitude
    };
    this.locations.push(newLocation);
  }

  /**
   * Return the list of locations
   * @returns {Array} an array of locations
   */
  getLocations() {
    return this.locations;
  }

  /**
   * Return the number of locations
   * @returns {number} the number of locations
   */
  getLocationsCount() {
    return this.locations.length;
  }

  /**
   * Remove the location in the given index
   * @param {number} idx 
   */
  removeLocation(idx) {
    this.locations.splice(idx, 1);
  }

  //**************************************************************************
  // this.forecasts
  /**
   * Find if the cityName has a forecast
   * @param {string} cityName
   */
  hasForecast(cityName) {
    return !!this.forecasts[cityName];
  }

  /**
   * Add new forecast for city name
   * @param {string} cityName 
   * @param {WeatherForecast} weather 
   */
  addForecast(cityName, weather) {
    this.forecasts[cityName] = weather;
  }

  /**
   * Remove forecast for the given cityName
   * @param {string} cityName 
   */
  removeForecast(cityName) {
    delete this.forecasts[cityName];
  }

  getForecast(cityName) {
    return this.forecasts[cityName];
  }

  //////////////////////////////////////
  setWeatherApiKey(apiKey) {
    this.apiKeys.weatherKey.key = apiKey;
    return this;
  }

  getWeatherApiKey() {
    return this.apiKeys.weatherKey.key;
  }

  setWeatherApiKeyValid(valid) {
    this.apiKeys.weatherKey.valid = valid;
    return this;
  }

  isWeatherApiKeyValid() {
    return this.apiKeys.weatherKey.valid;
  }

  //////////////////////////////////
  setLocationApiKey(apiKey) {
    this.apiKeys.locationKey.key = apiKey;
    return this;
  }

  getLocationApiKey() {
    return this.apiKeys.locationKey.key;
  }

  setLocationApiKeyValid(valid) {
    this.apiKeys.locationKey.valid = valid;
    return this;
  }

  isLocationApiKeyValid() {
    return this.apiKeys.locationKey.valid;
  }

  ///////////////////////////////////////
  isValidConfig() {
    return this.isLocationApiKeyValid() && this.isWeatherApiKeyValid();
  }
}

class WeatherForecastItem {
  constructor(obj = {}, fromNetwork = true) {
    this.units = obj.units;
    if (fromNetwork) {
      this.date = new Date(obj.dt * 1000);
      this.sunrise = new Date(obj.sunrise * 1000);
      this.sunset = new Date(obj.sunset * 1000);
      if (typeof obj.temp !== 'object') {
        this.temp = Math.round(obj.temp);
      } else {
        this.temp_min = Math.round(obj.temp.min);
        this.temp_max = Math.round(obj.temp.max);
      }
      this.feels_like = Math.round(obj.feels_like);
      this.pressure = obj.pressure;
      this.humidity = obj.humidity;
      if (obj.units == 'metric') {
        this.wind_speed = Math.round(obj.wind_speed * 3.6);
      } else {
        this.wind_speed = Math.round(obj.wind_speed);
      }
      this.wind_deg = obj.wind_deg;
      this.weather_id = obj.weather[0].id;
      this.weather_main = obj.weather[0].main;
      this.weather_description = obj.weather[0].description;
    } else {
      this.date = new Date(obj.date);
      this.sunrise = new Date(obj.sunrise);
      this.sunset = new Date(obj.sunset);
      if (obj.temp) {
        this.temp = obj.temp;
      } else {
        this.temp_min = obj.temp_min;
        this.temp_max = obj.temp_max;
      }
      this.feels_like = obj.feels_like;
      this.pressure = obj.pressure;
      this.humidity = obj.humidity;
      this.wind_speed = obj.wind_speed;
      this.wind_deg = obj.wind_deg;
      this.weather_id = obj.weather_id;
      this.weather_main = obj.weather_main;
      this.weather_description = obj.weather_description;
    }
  }
}

class WeatherForecast {
  constructor(obj = {}, fromNetwork = true) {
    this.cityName = obj.cityName;
    this.longitude = obj.lon;
    this.latitude = obj.lat;
    this.timezone = obj.timezone;
    this.units = obj.units;
    if (fromNetwork) {
      this.timezone_utc = Math.floor(obj.timezone_offset / 3600);
    } else {
      this.timezone_utc = obj.timezone_utc;
    }
    this.current = new WeatherForecastItem({
      units: this.units,
      ...obj.current
    }, fromNetwork);
    this.daily = obj.daily.map(day => new WeatherForecastItem({
      units: this.units,
      ...day
    }, fromNetwork));
  }
}


class ForecastCards {
  constructor(settings) {
    this.settings = settings;
    this.template = document.querySelector('#weather-template');
    this.cards = [];
    this.settings.getLocations().forEach(location => this.addLocation(location));
  }

  addLocation(location) {
    const card = this.addCard();
    const oldForecast = this.settings.getForecast(location.cityName);
    if (oldForecast) {
      this.renderCard(card, oldForecast);
    }
    this.fetchFromNetwork(location)
      .then(forecast => {
        this.settings.addForecast(location.cityName, forecast);
        this.settings.save();
        this.renderCard(card, forecast);
      });
  }

  fetchFromNetwork(location) {
    return fetch(`${BASE_URL}?lon=${location.longitude}&lat=${location.latitude}&exclude=hourly,minutely&appid=${this.settings.getWeatherApiKey()}&units=${this.settings.getMiscSettings('units')}`)
      .then(response => response.json())
      .then(data => {
        if (data.cod && data.cod !== 200) {
          throw new Error(data.message);
          return;
        }
        return new WeatherForecast({
          units: this.settings.getMiscSettings('units'),
          cityName: location.cityName,
          ...data
        });
      });
  }

  /**
   * Refresh all cards content from network
   */
  refreshAllCards() {
    this.cards.forEach((card, index) => this.refreshCardData(index));
  }

  /**
   * Refresh card content from network
   * @param {number} index 
   */
  refreshCardData(index) {
    const location = this.settings.getLocation(index);
    const card = this.cards[index];
    this.fetchFromNetwork(location)
      .then(forecast => {
        this.settings.addForecast(location.cityName, forecast);
        this.settings.save();
        this.renderCard(card, forecast);
      });
  }

  /**
   * Add a new weather forecast card
   */
  addCard() {
    const card = this.template.cloneNode(true);

    card.querySelector('.remove-city')
      .addEventListener('click', e => {
        this.removeCard(card);
      }, false);

    document.querySelector('main').appendChild(card);
    card.removeAttribute('hidden');
    this.cards.push(card);
    return card;
  }

  /**
   * Remove one forecast card
   * @param {Node} card 
   */
  removeCard(card) {
    if (!confirm('Are you sure to remove this location?')) {
      return;
    }
    const idx = this.cards.indexOf(card);
    card.remove();
    this.cards.splice(idx, 1);
    const location = this.settings.getLocation(idx);
    this.settings.removeLocation(idx);
    this.settings.removeForecast(location.cityName);
    this.settings.save();
  }

  /**
   * Render a weather data in the card
   * @param {Node} card 
   * @param {WeatherForecast} weather 
   */
  renderCard(card, weather) {
    if (!weather) {
      return;
    }

    const lastUpdatedElem = card.querySelector('.card-last-updated');
    const lastUpdated = new Date(lastUpdatedElem.textContent);

    if (lastUpdated >= weather.date) {
      return;
    }
    lastUpdatedElem.textContent = weather.date;

    card.querySelector('.location').textContent = weather.cityName;
    card.setAttribute('id', `weather-card-${weather.cityName.toLowerCase().split(' ').join('_')}`);

    card.querySelector('.description').textContent = weather.current.weather_description;
    const forecastFrom = weather.current.date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    card.querySelector('.date').textContent = forecastFrom;
    card.querySelector('.current .icon')
      .className = `icon ${weather.current.weather_main.toLowerCase()}`;
    card.querySelector('.current .temperature .value')
      .textContent = weather.current.temp;
    card.querySelector('.current .temperature .scale')
      .textContent = weather.units === 'metric' ? '°C' : '°F';
    card.querySelector('.current .humidity .value')
      .textContent = weather.current.humidity;
    card.querySelector('.current .wind .value')
      .textContent = weather.current.wind_speed;
    card.querySelector('.current .wind .scale')
      .textContent = weather.units === 'metric' ? 'km/h' : 'mph';
    card.querySelector('.current .wind .direction')
      .textContent = weather.current.wind_deg;
    const sunrise = weather.current.sunrise.toLocaleTimeString("en-US", {
      hc: 'h24',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    card.querySelector('.current .sunrise .value').textContent = sunrise;
    const sunset = weather.current.sunset.toLocaleTimeString("en-US", {
      hc: 'h24',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    card.querySelector('.current .sunset .value').textContent = sunset;

    const futureTiles = card.querySelectorAll('.future .oneday');
    futureTiles.forEach((tile, index) => {
      const forecast = weather.daily[index];
      const forecastFor = forecast.date.toLocaleString("en-US", {
        weekday: 'short'
      });
      tile.querySelector('.date').textContent = forecastFor;
      tile.querySelector('.icon').className = `icon ${forecast.weather_main.toLowerCase()}`;
      tile.querySelector('.temp-high .value')
        .textContent = forecast.temp_max;
      tile.querySelector('.temp-low .value')
        .textContent = forecast.temp_min;
    });

    const spinner = card.querySelector('.card-spinner');
    if (spinner) {
      card.removeChild(spinner);
    }
  }

  showCard(card) {
    card.removeAttribute('hidden');
  }

  hideCard(card) {
    card.setAttribute('hidden', '');
  }

  showAll() {
    this.cards.forEach(card => this.showCard(card));
  }

  hideAll() {
    this.cards.forEach(card => this.hideCard(card));
  }
}

function fetchDataFromNetwork(cityName, longitude, latitude) {
  return fetch(`${BASE_URL}?lon=${longitude}&lat=${latitude}&exclude=hourly,minutely&appid=${settings.getWeatherApiKey()}&units=metric`)
    .then(response => response.json())
    .then(data => {
      if (data.cod && data.cod !== 200) {
        throw new Error(data.message);
      }
      return new WeatherForecast({ cityName, ...data });
    });
}

function fetchLocationFromNetwork(longitude, latitude) {
  const baseUrl = 'https://us1.locationiq.com/v1/reverse.php?format=json';
  return fetch(`${baseUrl}&key=${settings.getLocationApiKey()}&lat=${latitude}&lon=${longitude}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(`LocationIQ API Key, ${data.error}`);
      }
      return data;
    });
}

class FormErrors {
  constructor(formErrElem) {
    this.formErrElem = formErrElem;
  }

  clear() {
    this.formErrElem.innerHTML = '';
  }

  addError(errorMessage) {
    const li = document.createElement('li');
    li.textContent = errorMessage;
    this.formErrElem.appendChild(li);
  }
}

/**
 * This class implements the dialog used to change application settings
 */
class SettingsCard {
  constructor(settings) {
    this.settings = settings;
    this.template = document.querySelector('#settings-input');
    this.inpWeatherKey = this.template.querySelector('#api-key');
    this.inpLocationKey = this.template.querySelector('#lociq-api-key');
    this.inpUnits = this.template.querySelector('#units');
    this.formElem = this.template.querySelector('form');
    this.formErrors = new FormErrors(this.formElem.querySelector('.errors'));
    this.submitHandler = () => { };
    this.formElem.addEventListener('submit', e => {
      this.submitHandler(e);
    });
    this.formElem.addEventListener('reset', e => {
      e.preventDefault();
      this.hide();
    });
  }

  loadSettings() {
    this.inpWeatherKey.value = this.settings.getWeatherApiKey();
    this.inpLocationKey.value = this.settings.getLocationApiKey();
    this.inpUnits.value = this.settings.getMiscSettings('units');
    return this;
  }

  saveSettings() {
    this.settings
      .setWeatherApiKey(this.inpWeatherKey.value)
      .setLocationApiKey(this.inpLocationKey.value)
      .setMiscSettings('units', this.inpUnits.value)
      .save();
    return this;
  }

  show() {
    this.template.removeAttribute('hidden');
    return this;
  }

  hide() {
    this.template.setAttribute('hidden', '');
    return this;
  }

  onSubmit(callback) {
    this.submitHandler = callback;
    return this;
  }
}

/**
 * This class implements the dialog that is used to add new cities
 */
class NewLocationTemplate {
  constructor() {
    this.template = document.querySelector('#new-location-template');
    this.formErrors = new FormErrors(this.template.querySelector('.errors'));
    this.saveBtn = this.template.querySelector('#save-city');
    this.cancelBtn = this.template.querySelector('#cancel-city');
    this.cityNameInput = this.template.querySelector('#cityname');
    this.longInput = this.template.querySelector('#longitude');
    this.latInput = this.template.querySelector('#latitude');
    this.saveCallback = () => true;
    this.cancelCallback = () => { };

    this.saveBtn.addEventListener('click', e => {
      e.preventDefault();
      if (this.saveCallback(this.getLocation(), this)) {
        this.hide();
      }
    });
    this.cancelBtn.addEventListener('click', e => {
      e.preventDefault();
      this.cancelCallback();
      this.hide();
    });

    this.mode = 'edit';
  }

  getMode() {
    return this.mode;
  }

  setMode(mode) {
    if (mode == 'add') {
      this.template.querySelector('h2').textContent = 'Add new city';
      this.saveBtn.textContent = 'Add city';
    } else {
      this.template.querySelector('h2').textContent = 'Edit city';
      this.saveBtn.textContent = 'Save';
    }
    return this;
  }

  setLocation(location = {}) {
    this.cityNameInput.value = location.cityName || 'Hammam Sousse';
    this.longInput.value = location.longitude || 10.6;
    this.latInput.value = location.latitude || 35.86;
    return this;
  }

  getLocation() {
    return {
      cityName: this.cityNameInput.value,
      longitude: +this.longInput.value,
      latitude: +this.latInput.value
    };
  }

  isVisible() {
    return !this.template.hasAttribute('hidden');
  }

  show() {
    this.template.removeAttribute('hidden');
    return this;
  }

  hide() {
    this.template.setAttribute('hidden', '');
    return this;
  }

  onSave(callback) {
    this.saveCallback = callback;
    return this;
  }

  onCancel(callback) {
    this.cancelCallback = callback;
    return this;
  }
}

const settings = new ApplicationSettings();

const butAdd = document.querySelector('#butAdd');
const btnSettings = document.querySelector('#btn-settings');

const locationTemplate = new NewLocationTemplate();
const forecastCards = new ForecastCards(settings);
const settingsCard = new SettingsCard(settings);
settingsCard.onSubmit(e => {
  e.preventDefault();

  settingsCard
    .saveSettings();
  settings
    .setWeatherApiKeyValid(false)
    .setWeatherApiKeyValid(false)
    .save();

  settingsCard.formErrors.clear();
  verifyWeatherApiKey()
    .then(() => {
      settings
        .setWeatherApiKeyValid(true)
        .save();
      return verifyLocationApiKey();
    })
    .then(() => {
      settings
        .setLocationApiKeyValid(true)
        .save();
    })
    .then(() => {
      settingsCard.hide();
      forecastCards.refreshAllCards();
    })
    .catch(err => settingsCard.formErrors.addError(err));
});

/**
 * Verify the validity of the weather API Key
 */
function verifyWeatherApiKey() {
  return new Promise((resolve, reject) => {
    return fetchDataFromNetwork('Hammam Sousse', 10.6, 35.86)
      .then(() => resolve(true))
      .catch(err => reject(err));
  });
}

/**
 * Verify the validity of the location API Key
 */
function verifyLocationApiKey() {
  return new Promise((resolve, reject) => {
    return fetchLocationFromNetwork(10.6, 35.86)
      .then(() => resolve(true))
      .catch(err => reject(err));
  });
}

function addLocationHandler() {
  if (!locationTemplate.isVisible()) {
    forecastCards.hideAll();
    locationTemplate
      .setMode('add')
      .setLocation()
      .show()
      .onCancel(() => {
        forecastCards.showAll();
      })
      .onSave((location, locationTemplate) => {
        const idxByName = settings.findLocationByCity(location.cityName);
        const idxByCoords = settings.findLocationByCoords(
          location.longitude, location.latitude);
        if (idxByCoords === -1 && idxByName === -1) {
          settings.addLocation(location);
          settings.save();
          forecastCards.showAll();
          forecastCards.addLocation(location);
          return true;
        } else {
          if (idxByCoords !== -1 && idxByName !== -1) {
            locationTemplate.formErrors
              .addError(`The city name '${location.cityName}' and its coordinates (longitude: ${location.longitude}, latitude: ${location.latitude}) are used`);
          } else if (idxByCoords !== -1) {
            locationTemplate.formErrors
              .addError(`The city coordinates (longitude: ${location.longitude}, latitude: ${location.latitude}) are used`);
          } else {
            locationTemplate.formErrors
              .addError(`The city name '${location.cityName}' is used`);
          }
        }
      });
  }
}
butAdd.addEventListener('click', e => addLocationHandler());

const btnSettingsHandler = (e) => {
  settingsCard
    .loadSettings()
    .show();
};
btnSettings.addEventListener('click', btnSettingsHandler);

if (!settings.isValidConfig()) {
  btnSettingsHandler();
} else {
  // Find the current position
  if (navigator.geolocation) {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
      },
      (err) => {
        console.warn(`ERREUR (${err.code}): ${err.message}`);
      }, options);
  }
  if (settings.getLocationsCount() === 0) {
    addLocationHandler();
  }
}