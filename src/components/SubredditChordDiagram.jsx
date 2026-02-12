import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

const SubredditChordDiagram = ({ comments }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [timeRange, setTimeRange] = useState([0, 100]);
  
  // Get date range from comments
  const dateRange = useMemo(() => {
    if (!comments || comments.length === 0) return { start: null, end: null };
    const timestamps = comments.map(c => c.timestamp);
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    return {
      start: new Date(minTime * 1000),
      end: new Date(maxTime * 1000)
    };
  }, [comments]);
  
  // Calculate current date range based on slider position
  const currentDateRange = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return { start: null, end: null };
    const totalMs = dateRange.end - dateRange.start;
    const startMs = dateRange.start.getTime() + (totalMs * timeRange[0] / 100);
    const endMs = dateRange.start.getTime() + (totalMs * timeRange[1] / 100);
    return {
      start: new Date(startMs),
      end: new Date(endMs)
    };
  }, [dateRange, timeRange]);

  // Filter comments by time range
  const filteredComments = useMemo(() => {
    if (!comments || comments.length === 0) return [];
    
    const sorted = [...comments].sort((a, b) => a.timestamp - b.timestamp);
    const startIdx = Math.floor((timeRange[0] / 100) * sorted.length);
    const endIdx = Math.ceil((timeRange[1] / 100) * sorted.length);
    
    return sorted.slice(startIdx, endIdx);
  }, [comments, timeRange]);

  useEffect(() => {
    if (!filteredComments || filteredComments.length === 0 || !svgRef.current || !containerRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Use filtered comments
    const sortedComments = filteredComments;

    // Build transition matrix between subreddits
    const transitions = {};
    const subredditSet = new Set();

    for (let i = 0; i < sortedComments.length - 1; i++) {
      const from = sortedComments[i].subreddit;
      const to = sortedComments[i + 1].subreddit;
      
      if (from && to) {
        subredditSet.add(from);
        subredditSet.add(to);
        
        const key = `${from}->${to}`;
        transitions[key] = (transitions[key] || 0) + 1;
      }
    }

    // Get top subreddits by activity
    const subredditCounts = {};
    sortedComments.forEach(c => {
      if (c.subreddit) {
        subredditCounts[c.subreddit] = (subredditCounts[c.subreddit] || 0) + 1;
      }
    });

    const topSubreddits = Object.entries(subredditCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name]) => name);

    // Build matrix for chord diagram
    const n = topSubreddits.length;
    const matrix = Array(n).fill(0).map(() => Array(n).fill(0));

    Object.entries(transitions).forEach(([key, count]) => {
      const [from, to] = key.split('->');
      const fromIdx = topSubreddits.indexOf(from);
      const toIdx = topSubreddits.indexOf(to);
      
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        matrix[fromIdx][toIdx] += count;
      }
    });

    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const size = Math.min(containerWidth, containerHeight);
    const width = size;
    const height = size;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    const outerRadius = Math.max(Math.min(width, height) * 0.23, 25);
    const innerRadius = Math.max(outerRadius - 20, 5);

    // Color scale - using desaturated red palette
    const desaturatedRedPalette = [
      '#ff6b6b',  // Primary red
      '#dc5a5a',  // Darker muted red
      '#ff8282',  // Lighter muted red
      '#c85050',  // Deep muted red
      '#ff9696',  // Pale muted red
      '#b44646',  // Very dark muted red
      '#ff7878',  // Medium muted red
      '#e66464',  // Medium dark muted red
      '#ff8c8c',  // Medium light muted red
      '#be4b4b',  // Dark desaturated red
      '#ffa0a0',  // Light pale red
      '#d45555'   // Deep crimson red
    ];
    const color = d3.scaleOrdinal()
      .domain(topSubreddits)
      .range(desaturatedRedPalette);

    // Create chord layout
    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const ribbon = d3.ribbon()
      .radius(innerRadius);

    const chords = chord(matrix);

    // Add ribbons (connections)
    const ribbonGroup = svg.append('g')
      .selectAll('path')
      .data(chords)
      .join('path')
      .attr('d', ribbon)
      .attr('fill', d => color(topSubreddits[d.source.index]))
      .attr('fill-opacity', 0.7)
      .attr('stroke', 'none')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .attr('fill-opacity', 0.8)
          .attr('stroke-width', 2);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .attr('fill-opacity', 0.5)
          .attr('stroke-width', 1);
      })
      .append('title')
      .text(d => `${topSubreddits[d.source.index]} → ${topSubreddits[d.target.index]}: ${d.source.value} transitions`);

    // Add arcs (subreddit segments)
    const group = svg.append('g')
      .selectAll('g')
      .data(chords.groups)
      .join('g');

    group.append('path')
      .attr('d', arc)
      .attr('fill', d => color(topSubreddits[d.index]))
      .attr('stroke', '#1a1a1a')
      .attr('stroke-width', 1.5)
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .attr('fill', d3.color(color(topSubreddits[d.index])).brighter(0.5));
        
        // Highlight connected ribbons
        ribbonGroup
          .attr('fill-opacity', r => 
            r.source.index === d.index || r.target.index === d.index ? 0.8 : 0.1
          );
      })
      .on('mouseleave', function() {
        d3.select(this)
          .attr('fill', d => color(topSubreddits[d.index]));
        
        ribbonGroup.attr('fill-opacity', 0.5);
      })
      .append('title')
      .text(d => `${topSubreddits[d.index]}: ${d.value} connections`);

    // Add labels
    group.append('text')
      .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr('dy', '0.35em')
      .attr('transform', d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 20})
        ${d.angle > Math.PI ? 'rotate(180)' : ''}
      `)
      .attr('text-anchor', d => d.angle > Math.PI ? 'end' : null)
      .attr('font-size', '11px')
      .attr('fill', '#ffffff')
      .text(d => topSubreddits[d.index]);

  }, [filteredComments]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      gap: '0'
    }}>
      <div style={{
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        gap: '12px'
      }}>
        <div>
          <h3 style={{ marginBottom: '8px' }}>Subreddit Flow</h3>
          <p className="stat-meta">
            Sequential jumps between subreddits showing activity patterns over time
          </p>
        </div>
        
        <div>
          <label style={{ 
            color: '#999999', 
            fontSize: '11px', 
            display: 'block', 
            marginBottom: '10px' 
          }}>
            Timeline
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#999', width: '70%' }}>
              <span>{currentDateRange.start ? currentDateRange.start.toLocaleDateString() : '—'}</span>
              <span>{currentDateRange.end ? currentDateRange.end.toLocaleDateString() : '—'}</span>
            </div>
            <div style={{ position: 'relative', height: '30px', width: '70%' }}>
              <style>{`
                .range-slider {
                  position: absolute;
                  width: 100%;
                  pointer-events: none;
                  -webkit-appearance: none;
                  appearance: none;
                  background: #666;
                  outline: none;
                  height: 1px;
                }
                .range-slider::-webkit-slider-track {
                  background: #666;
                  height: 1px;
                  border-radius: 0;
                }
                .range-slider::-moz-range-track {
                  background: #666;
                  height: 1px;
                  border-radius: 0;
                }
                .range-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 16px;
                  height: 16px;
                  background: #ff6b6b;
                  cursor: pointer;
                  border-radius: 50%;
                  pointer-events: auto;
                  position: relative;
                  z-index: 100;
                }
                .range-slider::-moz-range-thumb {
                  width: 16px;
                  height: 16px;
                  background: #ff6b6b;
                  cursor: pointer;
                  border-radius: 50%;
                  border: none;
                  pointer-events: auto;
                  position: relative;
                  z-index: 100;
                }
              `}</style>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={timeRange[0]}
                onChange={(e) => setTimeRange([Math.min(parseInt(e.target.value), timeRange[1] - 1), timeRange[1]])}
                className="range-slider"
              />
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={timeRange[1]}
                onChange={(e) => setTimeRange([timeRange[0], Math.max(parseInt(e.target.value), timeRange[0] + 1)])}
                className="range-slider"
              />
            </div>
          </div>
        </div>
      </div>
      <div ref={containerRef} style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
        <svg ref={svgRef} style={{ maxWidth: '100%', maxHeight: '100%', overflow: 'visible' }} />
      </div>
    </div>
  );
};

export default SubredditChordDiagram;
