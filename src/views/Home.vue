<!--
 * @Author: heht
 * @Date: 2021-08-11 22:36:31
 * @LastEditors: heht
 * @LastEditTime: 2022-02-07 17:58:12
 * @Description: 
-->
<template>
  <div class="view-container" ref="viewDiv"></div>
</template>

<script>
import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import Extent from "@arcgis/core/geometry/Extent";
import Camera from "@arcgis/core/Camera";

import axios from "axios";
import Hjson from "hjson";
import { addLayer } from "../utils/layer";

export default {
  name: "SceneView",
  data() {
    return {
      map: null,
    };
  },
  mounted() {
    this.initScene();
  },
  methods: {
    async initScene() {
      const baseLayer = addLayer({ type: "wmts" });
      let map = new Map({
        layers: [baseLayer],
      });

      this.map = map;
      const view = new SceneView({
        container: this.$refs.viewDiv,
        map: map,
        // camera: {
        //   position: {
        //     x: -118.808, //Longitude
        //     y: 33.961, //Latitude
        //     z: 2000, //Meters
        //   },
        //   tilt: 75,
        // },
        spatialReference: { wkid: 4490 },
        extent: new Extent({
          xmin: 122.16629824430832,
          ymin: 37.41419531457847,
          xmax: 122.18345512064325,
          ymax: 37.423703688868024,
          spatialReference: {
            wkid: 4490,
          },
        }),
      });
      this.$emit("scene-ready", { map: map, view: view });
      this.sceneView = view;

      const layerArr = await this.getLayersConfig();
      const layers = this.addLayers(layerArr);
      this.map.addMany(layers);
    },

    async getLayersConfig() {
      const res = await axios.get(`static/layerConfig.hjson`);
      const layersConfig = Hjson.parse(res.data);
      console.log("图层配置", layersConfig);
      return layersConfig;
    },

    addLayers(layers) {
      const lyrs = [];
      Array.isArray(layers) &&
        layers.forEach((layerInfo) => {
          const lyr = addLayer(layerInfo);
          lyrs.push(lyr);
        });
      return lyrs;
    },

    // 根据图层范围获取三维视角
    getLocateCamera(positionInfo) {
      const { heading = 0, tilt = 45, fov = 55, locateExtent } = positionInfo;
      if (locateExtent === undefined) {
        console.log("Missing Layer Full Extent.");
        return null;
      }
      const z = Math.ceil(locateExtent.zmax) * 2 || 1000; // TODO: 未考虑图层范围对海拔的影响
      const offsetInMeter = Math.round(z * Math.tan((tilt * Math.PI) / 180));
      const offsetInDegree = (offsetInMeter * 180) / (Math.PI * 6378137);
      return new Camera({
        heading,
        tilt,
        fov,
        position: {
          latitude: locateExtent.center.y - offsetInDegree,
          longitude: locateExtent.center.x,
          z,
          spatialReference: locateExtent.spatialReference,
        },
      });
    },
  },
};
</script>
<style scoped>
.view-container {
  width: 100%;
  height: 100%;
}
</style>
