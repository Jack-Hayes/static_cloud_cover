<template>
  <div>
    <div ref="map" style="height: 100vh;"></div>
  </div>
</template>

<script>
/* global L */
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/leaflet.js'; // Import Leaflet library
import 'leaflet.heat/dist/leaflet-heat.js';
import Papa from 'papaparse';

export default {
  data() {
    return {
      map: null,
      heatLayer: null,
    };
  },
  mounted() {
    this.initMap();
    this.loadData();
  },
  methods: {
    initMap() {
      this.map = L.map(this.$refs.map).setView([15, -95], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    },
    loadData() {
      Papa.parse('https://raw.githubusercontent.com/Jack-Hayes/static_cloud_cover/master/public/cloud_cover_df.csv', {
        download: true,
        complete: (result) => {
          const data = result.data.slice(1);
          this.createHeatmap(data);
        },
      });
    },
    createHeatmap(data) {
      const latlngs = data.map((row) => {
        const lat = parseFloat(row[0]);
        const lon = parseFloat(row[1]);
        const intensity = parseFloat(row[2]);

        // Check if coordinates are valid
        if (!isNaN(lat) && !isNaN(lon) && !isNaN(intensity)) {
          return [lat, lon, intensity];
        }

        return null; // Skip invalid data
      }).filter(point => point !== null);

      if (this.heatLayer) {
        this.map.removeLayer(this.heatLayer);
      }

      this.heatLayer = L.heatLayer(latlngs, {
        radius: 15,
        minOpacity: 0.5,
        maxZoom: 10,
        gradient: { 0.03: 'gray', 0.7: 'orange', 0.98: 'red' },
      }).addTo(this.map);
    },
  },
};
</script>

<style scoped>
#map {
  height: 100vh;
}
</style>