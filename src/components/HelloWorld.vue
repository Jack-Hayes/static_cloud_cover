<template>
  <div>
    <div ref="map" style="height: 400px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import csvPath from 'public\\cloud_cover_df.csv';

const map = ref(null);
// const latBounds = [13.5, 50.5];
// const lonBounds = [-130.5, -61.5];
let heatmapData = [];

onMounted(() => {
  initMap();
  parseCSV();
  displayHeatmap();
});

const initMap = () => {
  map.value = L.map('map').setView([33, -95], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map.value);
};

const parseCSV = async () => {
  try {
    const response = await fetch(csvPath);
    const data = await response.text();
    const lines = data.split('\n');
    lines.shift(); // Remove header line

    heatmapData = lines.map((line) => {
      const [lat, lon, intensity] = line.split(',').map(parseFloat);
      return [lat, lon, intensity];
    });
  } catch (error) {
    console.error('Error fetching CSV:', error);
  }
};

const displayHeatmap = () => {
  console.log('Displaying heatmap data:', heatmapData);

  L.heatLayer(heatmapData, {
    radius: 25,
    blur: 15,
    maxZoom: 10,
    gradient: { 0.4: 'grey', 0.65: 'orange', 1: 'red' },
  }).addTo(map.value);
};
</script>