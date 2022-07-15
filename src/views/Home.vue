<!--
 * @Author: heht
 * @Date: 2021-08-11 22:36:31
 * @LastEditors: heht
 * @LastEditTime: 2022-07-15 17:30:18
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
    return {
      map: null,
    };
  },
  mounted() {
    this.initScene();
  },
  methods: {
    async initScene() {
      const { baseLayers, topicLayers } = await this.getLayersConfig();
      const baseLayerArr = addLayers(baseLayers);
      let map = new Map({
        layers: baseLayerArr,
      });
      this.map = map;
      map.addMany(addLayers(topicLayers));
      // new MapView({
      //   container: this.$refs.viewDiv,
      //   map: map,
      //   spatialReference: { wkid: 4490 },
      //   extent: new Extent({
      //     xmin: 119.37764688740451,
      //     ymin: 28.249057643895988,
      //     xmax: 120.63730227954349,
      //     ymax: 29.0587023378092,
      //     spatialReference: {
      //       wkid: 4490,
      //     },
      //   }),
      // });
      const sceneView = new SceneView({
        container: this.$refs.viewDiv,
        map: map,
        spatialReference: { wkid: 4326 },
        extent: new Extent({
          xmin: 118.82927337887818,
          ymin: 28.974426993458984,
          xmax: 118.83570571305256,
          ymax: 28.979967073638424,
          spatialReference: {
            wkid: 4326,
          },
        }),
      });

      // sceneView.watch("center", (val) => {
      //   console.log(val.longitude, val.latitude);
      // });
    },

    handleQuery() {
      console.log("加载图层", this.map.layers);
      this.map.layers.items.forEach((item) => {
        if (item.type === "scene") {
        }
      });
    },

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
