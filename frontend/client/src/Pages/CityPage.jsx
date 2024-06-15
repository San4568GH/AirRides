// AddCityPage.js

import React, { useState, useEffect } from 'react';
import Cities from './Cities';

const cityInstance = Cities();

function CityPage () {
  const [cityName, setCityName] = useState('');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const getCities = async () => {
      const citiesData = await cityInstance.fetchCities();
      setCities(citiesData);
    };

    getCities();
  }, []);

  const handleAddCity = async (ev) => {
    ev.preventDefault();
    await cityInstance.addCity(cityName);
    setCityName('');
    const citiesData = await cityInstance.fetchCities();
    setCities(citiesData);
  };

  return (
    <div>
      <h1>Add City</h1>
      <form onSubmit={handleAddCity}>
        <input
          type="text"
          placeholder="City Name"
          value={cityName}
          onChange={(ev) => setCityName(ev.target.value)}
        />
        <button type="submit">Add City</button>
      </form>
      <h2>Existing Cities</h2>
      <ul>
        {cities.map((city) => (
          <li key={city._id}>{city.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default CityPage
