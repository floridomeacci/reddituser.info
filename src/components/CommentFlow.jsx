import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

export default function CommentFlow({ flowData }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!flowData || flowData.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Build nodes and links for Sankey
    const nodeMap = new Map();
    const links = [];

    flowData.forEach(({ from, to, count }) => {
      if (!nodeMap.has(from)) {
        nodeMap.set(from, { name: from, id: nodeMap.size });
      }
      if (!nodeMap.has(to)) {
        nodeMap.set(to, { name: to, id: nodeMap.size });
      }
      
      links.push({
        source: nodeMap.get(from).id,
        target: nodeMap.get(to).id,
        value: count
      });
    });

    const nodes = Array.from(nodeMap.values());

    // Create Sankey generator
    const sankeyGenerator = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[50, 10], [width - 50, height - 10]]);

    const { nodes: sankeyNodes, links: sankeyLinks } = sankeyGenerator({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(d => ({ ...d }))
    });

    // Color scale using red palette
    const colorScale = d3.scaleLinear()
      .domain([0, d3.max(sankeyLinks, d => d.value)])
      .range(['rgba(255, 107, 107, 0.3)', 'rgba(255, 107, 107, 0.8)']);

    // Draw links
    svg.append('g')
      .selectAll('path')
      .data(sankeyLinks)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => colorScale(d.value))
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('opacity', 0.6)
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.9);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.6);
      });

    // Draw nodes
    svg.append('g')
      .selectAll('rect')
      .data(sankeyNodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', '#ff6b6b')
      .attr('opacity', 0.8);

    // Add text labels
    svg.append('g')
      .selectAll('text')
      .data(sankeyNodes)
      .join('text')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .attr('font-size', '10px')
      .attr('fill', '#fff')
      .text(d => {
        // Strip position markers (_0, _1, _2, etc) and _end markers from display
        const displayName = d.name.replace(/_\d+$/, '').replace(/_end\d+$/, '');
        return displayName.length > 40 ? displayName.slice(0, 40) + '...' : displayName;
      });

  }, [flowData]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '300px'
      }}
    />
  );
}
