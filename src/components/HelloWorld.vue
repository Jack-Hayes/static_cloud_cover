<template>
  <div>
    <div id="map"></div>
    <div class="dropdown">
      <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        {{ selectedOption }}
      </button>
      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <a class="dropdown-item" href="#" @click="updateSelectedOption('mean')">Mean</a>
        <a class="dropdown-item" href="#" @click="updateSelectedOption('median')">Median</a>
        <a class="dropdown-item" href="#" @click="updateSelectedOption('mode')">Mode</a>
        <a class="dropdown-item" href="#" @click="updateSelectedOption('min')">Minimum</a>
        <a class="dropdown-item" href="#" @click="updateSelectedOption('max')">Maximum</a>
      </div>
    </div>
    <div class="legend">
      <div class="legend-title">Legend</div>
      <div class="gradient" :style="{ background: gradientBackground }"></div>
      <div class="labels">
        <div class="label" style="top: 80px;">1</div> <!-- Adjust margin as needed -->
        <div class="label">0</div>
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
    };
  },
  computed: {
    gradientBackground() {
      return `linear-gradient(to bottom, hsl(0, 100%, 50%) 0%, hsl(30, 100%, 50%) 33%, hsl(60, 100%, 50%) 66%, hsl(60, 100%, 50%) 100%)`;
    },
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
      fetch('https://raw.githubusercontent.com/Jack-Hayes/static_cloud_cover/master/public/us_half_deg_stats.csv')
        .then(response => response.text())
        .then(csvData => {
          this.parseData(csvData);
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
      const color = this.getColor(cloudCover);

      L.rectangle([
        [lat + 0.375, lon - 0.34],
        [lat - 0.375, lon + 0.34],
      ], {
        color: 'none', // No border
        fillColor: color,
        fillOpacity: 0.55,
      }).addTo(this.map);
    },
    getColor(cloudCover) {
      let hue, lightness;

      if (cloudCover >= 0.66) {
        hue = 0; // Red
        lightness = 50 + ((1 - cloudCover) * 50) + '%'; // Brightness decreases as cloudCover approaches 1
      } else if (cloudCover >= 0.33) {
        hue = 30; // Orange
        lightness = '50%'; // Constant brightness
      } else {
        hue = 60; // Yellow
        lightness = 50 + (cloudCover * 50) + '%'; // Brightness increases as cloudCover approaches 0
      }

      return `hsl(${hue}, 100%, ${lightness})`;
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
.dropdown {
  position: absolute;
  top: 10px;
  right: 10px;
}

.legend {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.gradient {
  width: 20px;
  height: 150px; /* Adjust height as needed */
  background: linear-gradient(to bottom, hsl(0, 100%, 50%) 0%, hsl(60, 100%, 50%) 25%, hsl(120, 100%, 50%) 50%, hsl(180, 100%, 50%) 75%, hsl(240, 100%, 50%) 100%);
}

.labels {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 12px;
}
</style>