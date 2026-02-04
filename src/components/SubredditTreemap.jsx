import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { COLORS } from '../design-tokens';

export default function SubredditTreemap({ subreddits }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!subreddits || subreddits.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Take top 10 subreddits
    const data = {
      name: 'root',
      children: subreddits.slice(0, 10).map(sub => ({
        name: sub.name,
        value: sub.count,
        karma: sub.karma || 0
      }))
    };

    // Color scale using red shades
    const colorScale = d3.scaleLinear()
      .domain([0, subreddits[0]?.count || 1])
      .range(['rgba(255, 107, 107, 0.3)', 'rgba(255, 107, 107, 1)']);

    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const treemap = d3.treemap()
      .size([width, height])
      .paddingInner(2)
      .paddingOuter(2)
      .round(true);

    treemap(root);

    const tooltip = d3.select(tooltipRef.current);

    const cell = svg.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    cell.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorScale(d.data.value))
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('mousemove', (event, d) => {
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`)
          .html(`
            <strong>r/${d.data.name}</strong><br/>
            ${d.data.value} activities<br/>
            ${d.data.karma} karma
          `);
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

    // Add text labels
    cell.append('text')
      .attr('x', 4)
      .attr('y', 14)
      .style('font-size', d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        return Math.min(width / 6, height / 3, 11) + 'px';
      })
      .style('fill', '#fff')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .text(d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        const minSize = Math.min(width, height);
        if (minSize < 30) return '';
        const maxChars = Math.floor(width / 6);
        return d.data.name.length > maxChars 
          ? d.data.name.slice(0, maxChars - 1) + '…' 
          : d.data.name;
      });

    // Add count labels
    cell.append('text')
      .attr('x', 4)
      .attr('y', 26)
      .style('font-size', d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        return Math.min(width / 8, height / 4, 9) + 'px';
      })
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('pointer-events', 'none')
      .text(d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        return Math.min(width, height) > 40 ? d.data.value : '';
      });

  }, [subreddits]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          padding: '8px 12px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          borderRadius: '4px',
          border: '1px solid rgba(255, 107, 107, 0.5)',
          fontSize: '11px',
          pointerEvents: 'none',
          opacity: 0,
          zIndex: 1000,
          transition: 'opacity 0.2s'
        }}
      />
    </div>
  );
}
