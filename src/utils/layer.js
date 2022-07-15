import TileInfo from "@arcgis/core/layers/support/TileInfo";

import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import Extent from "@arcgis/core/geometry/Extent";

const tileInfo = {
  dpi: 96,
  rows: 256,
  cols: 256,
  compressionQuality: 0,
  origin: {
    x: -180,
    y: 90,
  },
  spatialReference: {
    wkid: 4490,
  },
  lods: [
    {
      level: 0,
      levelValue: 1,
      resolution: 0.703125,
      scale: 295828763.7958547,
    },
    {
      level: 1,
      levelValue: 2,
      resolution: 0.3515625,
      scale: 147914381.89792734,
    },
    {
      level: 2,
      levelValue: 3,
      resolution: 0.17578125,
      scale: 73957190.94896367,
    },
    {
      level: 3,
      levelValue: 4,
      resolution: 0.087890625,
      scale: 36978595.474481836,
    },
    {
      level: 4,
      levelValue: 5,
      resolution: 0.0439453125,
      scale: 18489297.737240918,
    },
    {
      level: 5,
      levelValue: 6,
      resolution: 0.02197265625,
      scale: 9244648.868620459,
    },
    {
      level: 6,
      levelValue: 7,
      resolution: 0.010986328125,
      scale: 4622324.4343102295,
    },
    {
      level: 7,
      levelValue: 8,
      resolution: 0.0054931640625,
      scale: 2311162.2171551147,
    },
    {
      level: 8,
      levelValue: 9,
      resolution: 0.00274658203125,
      scale: 1155581.1085775574,
    },
    {
      level: 9,
      levelValue: 10,
      resolution: 0.001373291015625,
      scale: 577790.5542887787,
    },
    {
      level: 10,
      levelValue: 11,
      resolution: 0.0006866455078125,
      scale: 288895.27714438934,
    },
    {
      level: 11,
      levelValue: 12,
      resolution: 0.00034332275390625,
      scale: 144447.63857219467,
    },
    {
      level: 12,
      levelValue: 13,
      resolution: 0.000171661376953125,
      scale: 72223.81928609734,
    },
    {
      level: 13,
      levelValue: 14,
      resolution: 0.0000858306884765625,
      scale: 36111.90964304867,
    },
    {
      level: 14,
      levelValue: 15,
      resolution: 0.00004291534423828125,
      scale: 18055.954821524334,
    },
    {
      level: 15,
      levelValue: 16,
      resolution: 0.000021457672119140625,
      scale: 9027.977410762167,
    },
    {
      level: 16,
      levelValue: 17,
      resolution: 0.000010728836059570312,
      scale: 4513.9887053810835,
    },
    {
      level: 17,
      levelValue: 18,
      resolution: 0.000005364418029785156,
      scale: 2256.9943526905417,
    },
    {
      level: 18,
      levelValue: 19,
      resolution: 0.000002682209014892578,
      scale: 1128.4971763452709,
    },
    {
      level: 19,
      levelValue: 20,
      resolution: 0.000001341104507446289,
      scale: 564.2485881726354,
    },
  ],
};

export const addLayers = (layers) => {
  const lyrs = [];
  Array.isArray(layers) &&
    layers.forEach((layerInfo) => {
      const lyr = addLayer(layerInfo);
      lyrs.push(lyr);
    });
  return lyrs;
};

export const addLayer = (layerInfo) => {
  switch (layerInfo.type) {
    case "arcgis-dynamic":
      return createMapImageLayer(layerInfo);
    case "arcgis-tiled":
      return createTileLayer(layerInfo);
    case "wmts":
      return createWmtsLayer(layerInfo);
    case "IntegratedMesh":
      return createIntegratedMeshLayer(layerInfo);
    case "3DObject":
      return createSceneLayer(layerInfo);
    default:
      console.log("暂不支持此类型图层加载", layerInfo.type);
      return null;
  }
};

const createMapImageLayer = (layerInfo) => {
  const {
    id,
    url,
    layerID,
    opacity = 1,
    filter = "1=1",
    visible = true,
  } = layerInfo;
  const params =
    layerID === -1
      ? { id, url, opacity }
      : {
          id,
          url,
          opacity,
          sublayers: [
            {
              id: layerID,
              visible,
              definitionExpression: filter,
            },
          ],
        };
  const layerIns = new MapImageLayer(params);

  return layerIns;
};
const createTileLayer = (layerInfo) => {
  const {
    id,
    url,
    // tileInfo,
    // visible = true,
    // maxScale = 0,
    // minScale = 0,
  } = layerInfo;
  const layerIns = new TileLayer({
    id,
    url,
    // tileInfo: new TileInfo(tileInfo),
    // visible,
    // maxScale,
    // minScale,
  });
  return layerIns;
};
const createWmtsLayer = (layerInfo) => {
  const tileInfoParam = new TileInfo(tileInfo);
  const layerIns = new WebTileLayer({
    urlTemplate: layerInfo.url,
    subDomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
    tileInfo: tileInfoParam,
    spatialReference: tileInfo.spatialReference,
    fullExtent: new Extent(
      -180.0,
      -90.0,
      180.0,
      90.0,
      tileInfo.spatialReference
    ),
  });
  return layerIns;
};

const createIntegratedMeshLayer = (layerInfo) => {
  const layerIns = new IntegratedMeshLayer({
    url: layerInfo.url,
  });
  return layerIns;
  // map.add(meshLayer);
};

const createSceneLayer = (layerInfo) => {
  const { url, layerID } = layerInfo; // TODO: layerID
  const layerIns = new SceneLayer({
    url,
    outFields: ["*"],
    layerId: layerID,
    popupEnabled: false,
  });
  return layerIns;
};
