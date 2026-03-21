export interface ViewportBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface ClusteredNode {
  id: string;
  lat: number;
  lng: number;
  count: number;
  nodes: any[];
}

export interface MapPerformanceConfig {
  maxNodes?: number;
  renderDistance?: number;
  updateInterval?: number;
}

export class MapPerformanceOptimizer {
  private fps: number = 60;
  private lastFrameTime: number = Date.now();
  private frameCount: number = 0;
  private fpsUpdateInterval: number = 1000;
  private lastFpsUpdate: number = Date.now();
  private config: MapPerformanceConfig;

  constructor(config: MapPerformanceConfig = {}) {
    this.config = {
      maxNodes: config.maxNodes || 1000,
      renderDistance: config.renderDistance || 100,
      updateInterval: config.updateInterval || 16,
    };
  }

  culledNodes(nodes: any[], viewport: ViewportBounds): any[] {
    return nodes.filter(
      (node) =>
        node.lat >= viewport.minLat &&
        node.lat <= viewport.maxLat &&
        node.lng >= viewport.minLng &&
        node.lng <= viewport.maxLng,
    );
  }

  clusterNodes(nodes: any[], clusterRadius: number = 0.05): ClusteredNode[] {
    const clusters: Map<string, ClusteredNode> = new Map();

    nodes.forEach((node) => {
      const key = `${Math.round(node.lat / clusterRadius)}-${Math.round(node.lng / clusterRadius)}`;

      if (clusters.has(key)) {
        const cluster = clusters.get(key)!;
        cluster.count++;
        cluster.nodes.push(node);
      } else {
        clusters.set(key, {
          id: key,
          lat: node.lat,
          lng: node.lng,
          count: 1,
          nodes: [node],
        });
      }
    });

    return Array.from(clusters.values());
  }

  calculateFPS(): number {
    const now = Date.now();
    this.frameCount++;

    if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.fps = Math.round(
        (this.frameCount * 1000) / (now - this.lastFpsUpdate),
      );
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    return this.fps;
  }

  shouldRender(): boolean {
    const now = Date.now();
    const deltaTime = now - this.lastFrameTime;
    const targetFrameTime = 1000 / 60;

    if (deltaTime >= targetFrameTime) {
      this.lastFrameTime = now;
      return true;
    }

    return false;
  }

  getOptimalZoom(nodeCount: number): number {
    if (nodeCount > 1000) return 8;
    if (nodeCount > 500) return 10;
    if (nodeCount > 100) return 12;
    return 14;
  }

  reset(): void {
    this.fps = 60;
    this.frameCount = 0;
    this.lastFrameTime = Date.now();
    this.lastFpsUpdate = Date.now();
  }

  getConfig(): MapPerformanceConfig {
    return this.config;
  }
}

export default MapPerformanceOptimizer;
