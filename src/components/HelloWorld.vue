<template>
  <div>
    <div id="map"></div>
    <div class="btn-group">
      <button type="button" class="btn btn-secondary" @click="selectDataset('neutral')">Neutral</button>
      <button type="button" class="btn btn-secondary" @click="selectDataset('nino')">El Nino</button>
      <button type="button" class="btn btn-secondary" @click="selectDataset('nina')">La Nina</button>
    </div>
    <div class="dropdown">
      <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        {{ selectedOption }}
      </button>
      <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
        <a class="dropdown-item" href="#" @click="updateSelectedOption('mean')">Mean</a>
        <a class="dropdown-item" href="#" @click="updateSelectedOption('median')">Median</a>
        <a class="dropdown-item" href="#" @click="updateSelectedOption('mode')">Mode</a>
        <a class="dropdown-item" href="#" @click="updateSelectedOption('min')">Minimum</a>
        <a class="dropdown-item" href="#" @click="updateSelectedOption('max')">Maximum</a>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';

export default {
  data() {
    return {
      map: null,
      selectedOption: 'mean', // Default selected option
      selectedDataset: 'neutral', // Default selected dataset
    };
  },
  mounted() {
    this.initializeMap();
    this.loadData(this.selectedDataset); // Load data for the default dataset
  },
  methods: {
    initializeMap() {
      this.map = L.map('map').setView([37.5, -96], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);
    },
    loadData(dataset) {
      const start = performance.now(); // Track start time
      let csvURL = '';

      // Determine CSV URL based on selected dataset
      switch(dataset) {
        case 'neutral':
          csvURL = 'https://raw.githubusercontent.com/Jack-Hayes/static_cloud_cover/master/public/neutral.csv';
          break;
        case 'nino':
          csvURL = 'https://raw.githubusercontent.com/Jack-Hayes/static_cloud_cover/master/public/nino.csv';
          break;
        case 'nina':
          csvURL = 'https://raw.githubusercontent.com/Jack-Hayes/static_cloud_cover/master/public/nina.csv';
          break;
        default:
          console.error('Invalid dataset:', dataset);
          return;
      }

      fetch(csvURL)
        .then(response => response.text())
        .then(csvData => {
          this.parseData(csvData);
          const end = performance.now();
          console.log('Time taken to fetch data:', end - start, 'milliseconds');
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    },
    parseData(csvData) {
      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          result.data.forEach((row) => {
            const lat = parseFloat(row.latitude);
            const lon = parseFloat(row.longitude);
            const cloudCover = parseFloat(row[this.selectedOption + '_cloud_cover']); // Get cloud cover based on selected option
            this.addRectangle(lat, lon, cloudCover);
          });
        },
      });
    },
    addRectangle(lat, lon, cloudCover) {
      const opacity = cloudCover; // Higher cloud cover values are more opaque
      L.rectangle([
        [lat + 0.25, lon - 0.25],
        [lat - 0.25, lon + 0.25],
      ], {
        color: 'none', // No border
        fillColor: '#ffffff', // White
        fillOpacity: opacity,
      }).addTo(this.map);
    },
    selectDataset(dataset) {
      this.selectedDataset = dataset;
      this.map.eachLayer(layer => {
        if (layer instanceof L.Rectangle) {
          this.map.removeLayer(layer);
        }
      });
      this.loadData(dataset); // Load data for the selected dataset
    },
    updateSelectedOption(option) {
      this.selectedOption = option;
      this.map.eachLayer(layer => {
        if (layer instanceof L.Rectangle) {
          this.map.removeLayer(layer);
        }
      });
      this.loadData(this.selectedDataset); // Reload data with updated option for the current dataset
    },
  },
};
</script>

<style scoped>
#map {
  height: 80vh;
}

.btn-group {
  position: absolute;
  top: 10px;
  left: 10px;
}

.dropdown {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>