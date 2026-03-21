import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import {select} from "d3-selection";
import {zoom as d3zoom, zoomIdentity} from "d3-zoom";
import {useTheme} from "@mui/material";
import {useEffect, useId, useMemo, useRef, useState} from "react";
import type {TokenFlowEdge} from "../../../utils/tokenFlowGraph";

type GraphNode = {
  id: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

type GraphLink = {
  source: string | GraphNode;
  target: string | GraphNode;
};

type TokenFlowGraphCanvasProps = {
  centerId: string;
  edges: TokenFlowEdge[];
  height?: number;
};

export default function TokenFlowGraphCanvas({
  centerId,
  edges,
  height = 440,
}: TokenFlowGraphCanvasProps) {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const arrowId = useId().replace(/:/g, "");
  const [width, setWidth] = useState(640);

  const {nodes, links} = useMemo(() => {
    const ids = new Set<string>([centerId]);
    for (const e of edges) {
      ids.add(e.source);
      ids.add(e.target);
    }
    const nodeList: GraphNode[] = [...ids].map((id) => ({id}));
    const linkList: GraphLink[] = edges.map((e) => ({
      source: e.source,
      target: e.target,
    }));
    return {nodes: nodeList, links: linkList};
  }, [centerId, edges]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) {
      return;
    }
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) {
        setWidth(Math.floor(w));
      }
    });
    ro.observe(svgEl);
    const rect = svgEl.getBoundingClientRect();
    if (rect.width > 0) {
      setWidth(Math.floor(rect.width));
    }
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svgEl = svgRef.current;
    const gEl = gRef.current;
    if (!svgEl || !gEl || nodes.length === 0 || width < 40) {
      return;
    }

    const h = height;
    const stroke = theme.palette.divider;
    const primary = theme.palette.primary.main;
    const textMain = theme.palette.text.primary;

    const svg = select(svgEl);
    const g = select(gEl);
    g.selectAll("*").remove();

    const simulationNodes = nodes.map((n) => ({...n}));
    const simulationLinks = links.map((l) => ({...l}));

    const simulation = forceSimulation<GraphNode>(simulationNodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(simulationLinks)
          .id((d) => d.id)
          .distance(92),
      )
      .force("charge", forceManyBody().strength(-340))
      .force("center", forceCenter(width / 2, h / 2))
      .force("collide", forceCollide(48));

    const centerNode = simulationNodes.find((n) => n.id === centerId);
    if (centerNode) {
      centerNode.fx = width / 2;
      centerNode.fy = h / 2;
    }

    const linkSel = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(simulationLinks)
      .join("line")
      .attr("stroke", stroke)
      .attr("stroke-opacity", 0.85)
      .attr("stroke-width", 1.5)
      .attr("marker-end", `url(#${arrowId})`);

    const nodeSel = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(simulationNodes)
      .join("g");

    nodeSel
      .append("circle")
      .attr("r", (d) => (d.id === centerId ? 14 : 10))
      .attr("fill", (d) => (d.id === centerId ? primary : stroke))
      .attr("stroke", textMain)
      .attr("stroke-width", 1);

    nodeSel
      .append("text")
      .attr("dx", 16)
      .attr("dy", 4)
      .attr("font-size", 11)
      .attr("fill", textMain)
      .text((d) =>
        d.id === centerId
          ? "This account"
          : `${d.id.slice(0, 8)}…${d.id.slice(-6)}`,
      );

    const zoomed = (event: {transform: {toString: () => string}}) => {
      g.attr("transform", event.transform.toString());
    };

    const zoom = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 4])
      .on("zoom", zoomed);

    svg.call(zoom);
    svg.call(zoom.transform, zoomIdentity);

    simulation.on("tick", () => {
      linkSel
        .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
        .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
        .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
        .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

      nodeSel.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    simulation.alpha(1).restart();

    return () => {
      simulation.stop();
    };
  }, [arrowId, centerId, height, links, nodes, theme, width]);

  if (edges.length === 0) {
    return null;
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      role="img"
      aria-label="Token transfer graph"
      style={{display: "block", touchAction: "none"}}
    >
      <defs>
        <marker
          id={arrowId}
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={theme.palette.divider} />
        </marker>
      </defs>
      <g ref={gRef} />
    </svg>
  );
}
