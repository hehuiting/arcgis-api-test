<!--
 * @Author: heht
 * @Date: 2021-08-11 22:36:31
 * @LastEditors: heht
 * @LastEditTime: 2022-12-01 16:51:19
 * @Description: 
-->
<template>
  <div class="main">
    <div class="view-container" ref="viewDiv"></div>
    <Button class="query-btn" type="primary" @click="handleQuery">查询</Button>
  </div>
</template>

<script>
import Map from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import SceneView from "@arcgis/core/views/SceneView";
import MapView from "@arcgis/core/views/MapView";

import Extent from "@arcgis/core/geometry/Extent";
import Camera from "@arcgis/core/Camera";

import axios from "axios";
import Hjson from "hjson";
import { addLayers } from "../utils/layer";

export default {
  name: "SceneView",
  data() {
    return {};
  },
  mounted() {
    this.initScene();
  },
  methods: {
    async initScene() {
      const { baseLayers, topicLayers } = await this.getLayersConfig();
      const baseLayerArr = addLayers(baseLayers);
      const layers = addLayers(topicLayers);
      const baseMap = new Basemap({
        baseLayers: baseLayerArr,
      });
      let map = new Map({
        basemap: baseMap,
        layers: layers,
      });
      this.map = map;

      // new MapView({
      //   container: this.$refs.viewDiv,
      //   map: map,
      //   spatialReference: { wkid: 4490 },
      //   extent: new Extent({
      //     xmin: 119.37764688740451,
      //     ymin: 28.249057643895988,
      //     xmax: 120.63730227954349,
      //     ymax: 30.0587023378092,
      //     spatialReference: {
      //       wkid: 4490,
      //     },
      //   }),
      // });

      const sceneView = new SceneView({
        container: this.$refs.viewDiv,
        map: map,
        spatialReference: { wkid: 4490 },
        zoom: 7,
        center: [119.5, 28.7],
        extent: new Extent({
          xmin: 73.499012615,
          ymin: 3.83788899000001,
          xmax: 135.087376349,
          ymax: 53.561656769,
          spatialReference: {
            wkid: 4490,
          },
        }),
      });
    },

    handleQuery() {
      console.log("加载图层", this.map.layers);
      this.map.layers.items.forEach((item) => {
        if (item.type === "scene") {
        }
      });
    },

    // 获取图层配置信息
    async getLayersConfig() {
      const res = await axios.get(`static/layerConfig.hjson`);
      const layersConfig = Hjson.parse(res.data);
      console.log("图层配置", layersConfig);
      return layersConfig;
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
.main {
  width: 100%;
  height: 100%;
}
.view-container {
  width: 100%;
  height: 100%;
}
.query-btn {
  position: absolute;
  top: 1rem;
  left: 5rem;
}
</style>
