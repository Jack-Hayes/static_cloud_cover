<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';

export default {
  data() {
    return {
      map: null,
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
      fetch('https://raw.githubusercontent.com/Jack-Hayes/static_cloud_cover/master/public/one_tenth_degree_median.csv')
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
            const cloudCover = parseFloat(row.median_cloud_cover);

            this.addRectangle(lat, lon, cloudCover);
          });
        },
      });
    },
    addRectangle(lat, lon, cloudCover) {
      const color = this.getColor(cloudCover);

      L.rectangle([
        [lat + 0.05, lon - 0.05],
        [lat - 0.05, lon + 0.05],
      ], {
        color: 'none', // No border
        fillColor: color,
        fillOpacity: 0.7,
      }).addTo(this.map);
    },
    getColor(cloudCover) {
      // Calculate HSL color based on a gradient
      const hue = 30 + (cloudCover * 120); // 30° to 150°
      const saturation = '100%';
      const lightness = 50 + (cloudCover * 50) + '%'; // 50% to 100%

      return `hsl(${hue}, ${saturation}, ${lightness})`;
    },
  },
};
</script>

<style scoped>
#map {
  height: 100vh;
}
</style>