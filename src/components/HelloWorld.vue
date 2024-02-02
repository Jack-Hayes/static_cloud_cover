<template>
  <div>
    <div class="legend">
      <div class="legend-title">Cloud Cover Percent</div>
      <div class="color-bars">
        <div class="color-bar" v-for="(color, index) in colors" :key="index" :style="{ backgroundColor: color.color, opacity: color.opacity, borderColor: color.borderColor }">
          <div class="label">{{ color.label }}</div>
        </div>
      </div>
    </div>
    <div id="map"></div>
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
      colors: [
        { color: '#ffffff', opacity: 1, label: '0-20%', borderColor: 'black' },
        { color: 'Khaki', opacity: 0.6, label: '20-40%' },
        { color: 'gold', opacity: 0.6, label: '40-60%' },
        { color: 'orange', opacity: 0.6, label: '60-80%' },
        { color: 'red', opacity: 0.6, label: '80-100%' }
      ]
    };
  },
  mounted() {
    this.initializeMap();
    this.loadData();
  },
  methods: {
    initializeMap() {
      this.map = L.map('map').setView([37.5, -96], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);
    },
    loadData() {
      const start = performance.now(); // Track start time
      fetch('https://raw.githubusercontent.com/Jack-Hayes/static_cloud_cover/master/public/us_half_deg_stats.csv')
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
          result.data.forEach(row => {
            const lat = parseFloat(row.lat);
            const lon = parseFloat(row.lon);
            const cloudCover = parseFloat(row[this.selectedOption + '_cloud_cover']); // Get cloud cover based on selected option
            this.addRectangle(lat, lon, cloudCover);
          });
        },
      });
    },
    addRectangle(lat, lon, cloudCover) {
      const color = this.getColor(cloudCover); // Get color based on cloud cover
      const opacity = 0.6; // Constant opacity

      L.rectangle([
        [lat + 0.375, lon - 0.34],
        [lat - 0.375, lon + 0.34],
      ], {
        color: 'none', // No border
        fillColor: color, // Dynamic color based on cloud cover
        fillOpacity: opacity,
      }).addTo(this.map);
    },
    getColor(cloudCover) {
      if (cloudCover >= 0 && cloudCover < 0.2) {
        return '#ffffff'; // White
      } else if (cloudCover >= 0.2 && cloudCover < 0.4) {
        return 'Khaki';
      } else if (cloudCover >= 0.4 && cloudCover < 0.6) {
        return 'gold';
      } else if (cloudCover >= 0.6 && cloudCover < 0.8) {
        return 'orange';
      } else {
        return 'red';
      }
    },
    updateSelectedOption(option) {
      this.selectedOption = option;
      this.map.eachLayer(layer => {
        if (layer instanceof L.Rectangle) {
          this.map.removeLayer(layer);
        }
      });
      this.loadData(); // Reload data with updated option
    },
  },
};
</script>

<style scoped>
#map {
  height: 80vh;
}

.legend {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #ccc;
  border-radius: 5px;
  width: auto; /* Extend to contain the labels */
}

.legend-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.color-bars {
  display: flex;
  flex-direction: column;
}

.color-bar {
  height: 20px;
  margin-bottom: 5px;
  position: relative;
}

.color-bar .label {
  position: absolute;
  top: 50%;
  left: calc(100% + 5px);
  transform: translateY(-50%);
  white-space: nowrap;
  font-size: 10px; /* Reduce font size */
}

.dropdown {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>