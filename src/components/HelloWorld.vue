<template>
  <div>
    <div ref="map" style="height: 100vh;"></div>
  </div>
</template>

<script>
/* global L */
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/leaflet.js';
import 'leaflet.heat/dist/leaflet-heat.js';
import Papa from 'papaparse';

// Define radius values for each zoom level
const zoomToRadius = {
  3: 20,
  4: 10,
  5: 8,
  6: 4,
  // Add more levels as needed
};

export default {
  data() {
    return {
      map: null,
      heatLayer: null,
      defaultRadius: 10, // Initial radius
    };
  },
  mounted() {
    this.initMap();
    this.loadData();
  },
  methods: {
    initMap() {
      this.map = L.map(this.$refs.map).setView([15, -95], 3);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

      // Add zoomstart and zoomend event listeners
      this.map.on('zoomstart', this.onZoomStart);
      this.map.on('zoomend', this.onZoomEnd);
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
      const latStep = 1;
      const lonStep = 1;

      const latlngs = [];
      for (let lat = 13.5; lat <= 50.5; lat += latStep) {
        for (let lon = -130.5; lon <= -61.5; lon += lonStep) {
          const intensity = this.getIntensityForLocation(data, lat, lon);
          latlngs.push([lat, lon, intensity]);
        }
      }

      if (this.heatLayer) {
        this.map.removeLayer(this.heatLayer);
      }

      this.heatLayer = L.heatLayer(latlngs.filter(point => point[2] !== null), {
        radius: this.defaultRadius, // Set default radius
        minOpacity: 0.5,
        maxZoom: 10,
        gradient: {
          0: 'gray',
          0.6: 'yellow',
          1: 'red',
        }
      }).addTo(this.map);
    },
    getIntensityForLocation(data, lat, lon) {
      const point = data.find(row => {
        const rowLat = parseFloat(row[0]);
        const rowLon = parseFloat(row[1]);
        return !isNaN(rowLat) && !isNaN(rowLon) && Math.abs(rowLat - lat) < 0.5 && Math.abs(rowLon - lon) < 0.5;
      });

      return point ? parseFloat(point[2]) : null;
    },
    onZoomStart() {
      // Zoom level changed... adjust heatmap layer options!
      const newRadius = this.getRadius();
      this.heatLayer.setOptions({
        radius: newRadius,
      });
    },
    onZoomEnd() {
      // Redraw the heatmap after zooming is complete
      this.heatLayer.redraw();
    },
    getRadius() {
      // Get the current zoom level
      const zoomLevel = this.map.getZoom();

      // Use the predefined radius for the current zoom level
      return zoomToRadius[zoomLevel] || this.defaultRadius;
    },
  },
};
</script>

<style scoped>
#map {
  height: 100vh;
}
</style>