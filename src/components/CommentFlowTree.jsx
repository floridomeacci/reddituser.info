import { useEffect, useRef, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsTreemap from 'highcharts/modules/treemap';
import HighchartsTreegraph from 'highcharts/modules/treegraph';
import HighchartsAccessibility from 'highcharts/modules/accessibility';

// Initialize modules
if (typeof Highcharts === 'object') {
  // Handle potential ESM/CJS interop issues
  const initTreemap = typeof HighchartsTreemap === 'function' ? HighchartsTreemap : HighchartsTreemap.default;
  const initTreegraph = typeof HighchartsTreegraph === 'function' ? HighchartsTreegraph : HighchartsTreegraph.default;
  const initAccessibility = typeof HighchartsAccessibility === 'function'
    ? HighchartsAccessibility
    : HighchartsAccessibility?.default;

  if (typeof initTreemap === 'function') initTreemap(Highcharts);
  if (typeof initTreegraph === 'function') initTreegraph(Highcharts);
  if (typeof initAccessibility === 'function') initAccessibility(Highcharts);
}

const CommentFlowTree = ({ treeData: allTreeData }) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1000); // Default fallback
  const [nodeDistance, setNodeDistance] = useState(5);
  const [levelDistance, setLevelDistance] = useState(71); // nodeWidth controls horizontal spacing
  const [fontSize, setFontSize] = useState(9);
  const [nodeRadius, setNodeRadius] = useState(1); // Super tiny dots
  const [forceUpdate, setForceUpdate] = useState(0);
  const [currentTreeIndex, setCurrentTreeIndex] = useState(0);

  // Check if allTreeData is an array of trees or a single tree
  const trees = useMemo(() => {
    if (!allTreeData || allTreeData.length === 0) return [];
    
    // Check if it's an array of arrays (multiple trees)
    if (Array.isArray(allTreeData[0])) {
      return allTreeData;
    }
    
    // Otherwise it's a single tree, wrap it
    return [allTreeData];
  }, [allTreeData]);

  const treeData = trees[currentTreeIndex] || [];
  
  console.log('CommentFlowTree debug:', { 
    allTreeData: allTreeData?.length, 
    trees: trees?.length, 
    currentTreeIndex, 
    treeData: treeData?.length 
  });

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);



  // Calculate tree metrics
  const { leafCount, maxDepth } = (() => {
    if (!treeData || treeData.length === 0) return { leafCount: 0, maxDepth: 0 };
    
    // Build adjacency list
    const children = {};
    let rootId = null;
    const allIds = new Set();
    const parentIds = new Set();
    
    treeData.forEach(node => {
      allIds.add(node.id);
      if (node.parent === null || node.parent === undefined) {
        rootId = node.id;
      } else {
        parentIds.add(node.parent);
        if (!children[node.parent]) children[node.parent] = [];
        children[node.parent].push(node.id);
      }
    });
    
    // Leaf count: nodes that are not parents
    let leaves = 0;
    allIds.forEach(id => {
      if (!parentIds.has(id)) leaves++;
    });
    
    if (!rootId) return { leafCount: leaves || 1, maxDepth: 1 };
    
    // BFS to find max depth
    let maxD = 0;
    const queue = [{ id: rootId, depth: 1 }];
    
    while (queue.length > 0) {
      const { id, depth } = queue.shift();
      maxD = Math.max(maxD, depth);
      
      if (children[id]) {
        children[id].forEach(childId => {
          queue.push({ id: childId, depth: depth + 1 });
        });
      }
    }
    
    return { leafCount: leaves, maxDepth: maxD };
  })();

  // Adjust level distance based on depth: 71px for 4 levels, 50px for 5+ levels
  const adjustedLevelDistance = maxDepth >= 5 ? 50 : levelDistance;

  // Calculate dynamic height to prevent vertical overlap
  // Use nodeDistance to control vertical spacing
  const dynamicHeight = Math.max(300, (leafCount || 1) * nodeDistance);



  // Generate levels configuration dynamically with useMemo to ensure re-render
  const levels = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 50; i++) {
      // Fade opacity from 1.0 down to 0.3
      const opacity = Math.max(0.3, 1 - (i * 0.02));

      arr.push({
        level: i,
        color: `rgba(100, 100, 100, ${opacity})`,
        dataLabels: {
          style: {
            whiteSpace: 'nowrap',
            textOverflow: 'clip'
          }
        }
      });
    }
    return arr;
  }, [levelDistance]);

  const options = useMemo(() => ({
    chart: {
      backgroundColor: 'transparent',
      height: dynamicHeight,
      width: adjustedLevelDistance * 15, // Much wider to ensure last level shows
      marginLeft: 0,
      spacingLeft: 0,
      marginRight: 400,
      spacingRight: 200,
      inverted: false
    },
    title: {
      text: null
    },
    credits: {
      enabled: false
    },
    series: [{
      type: 'treegraph',
      data: treeData,
      collapseButton: {
        enabled: false
      },
      nodeWidth: levelDistance, // THIS controls horizontal spacing between columns!
      linkLineWidth: 1,
      // Highlight branch on hover
      cursor: 'pointer',
      states: {
        hover: {
          enabled: false
        },
        inactive: {
          enabled: false
        }
      },
      // Custom events to handle branch highlighting
      point: {
        events: {
          mouseOver: function() {
            const series = this.series;
            const chart = series.chart;
            const hoveredPoint = this;

            // Build relationship map from the ORIGINAL treeData structure
            // This is more reliable than using Highcharts' link objects
            const treeData = series.options.data;
            const childrenMap = new Map();
            const parentMap = new Map();
            
            // Build maps from the raw data structure
            treeData.forEach(node => {
              if (node.parent !== null && node.parent !== undefined) {
                parentMap.set(node.id, node.parent);
                
                // Add to children map
                if (!childrenMap.has(node.parent)) {
                  childrenMap.set(node.parent, []);
                }
                childrenMap.get(node.parent).push(node.id);
              }
            });

            // Collect the ENTIRE branch: from root → through hovered node → to all leaf descendants
            const pathNodes = new Set();

            // Step 1: Traverse UP to root to get all ancestors
            let current = hoveredPoint.id;
            while (current !== null && current !== undefined) {
              pathNodes.add(current);
              current = parentMap.get(current);
            }

            // Step 2: Traverse DOWN from hovered node to get ALL descendants
            const stack = [hoveredPoint.id];
            const visited = new Set([hoveredPoint.id]);
            
            while (stack.length > 0) {
              const nodeId = stack.pop();
              pathNodes.add(nodeId);
              
              const children = childrenMap.get(nodeId);
              if (children && children.length > 0) {
                children.forEach(childId => {
                  if (!visited.has(childId)) {
                    visited.add(childId);
                    stack.push(childId);
                    pathNodes.add(childId);
                  }
                });
              }
            }

            // 3. Apply Visuals to Nodes
            const points = series.points;
            points.forEach(p => {
              if (!p || !p.series) return; // Safety check
              if (pathNodes.has(p.id)) {
                // Force hover state OFF to prevent Highcharts interference
                try {
                  p.setState('');
                } catch (e) {
                  // Ignore setState errors
                }
                if (p.graphic) {
                    p.graphic.attr({ 
                      fill: '#ff6b6b',
                      fillColor: '#ff6b6b',
                      color: '#ff6b6b'
                    });
                }
                if (p.dataLabel) {
                    p.dataLabel.css({
                        color: '#ff6b6b',
                        opacity: 1,
                        textShadow: 'none',
                        textOutline: 'none',
                        fontWeight: '500'
                    });
                    // Ensure background is fully opaque
                    if (p.dataLabel.box) {
                        p.dataLabel.box.attr({ 
                          opacity: 1, 
                          fill: '#1a1a1a',
                          stroke: '#ff6b6b',
                          'stroke-width': 1
                        });
                    }
                }
              } else {
                try {
                  p.setState('');
                } catch (e) {
                  // Ignore setState errors
                }
                if (p.graphic) {
                    p.graphic.attr({ 
                      fill: '#666666',
                      fillColor: '#666666',
                      color: '#666666'
                    });
                }
                if (p.dataLabel) {
                    p.dataLabel.css({
                        color: '#666666',
                        opacity: 0.3,
                        textShadow: 'none',
                        textOutline: 'none',
                        fontWeight: 'normal'
                    });
                    if (p.dataLabel.box) {
                        p.dataLabel.box.attr({ 
                          opacity: 0.3,
                          stroke: 'none'
                        });
                    }
                }
              }
            });
            
            // 4. Collect and style ALL links in the chart
            const allLinks = new Set();
            points.forEach(p => {
              if (p.linksFrom) {
                p.linksFrom.forEach(l => allLinks.add(l));
              }
              if (p.linksTo) {
                p.linksTo.forEach(l => allLinks.add(l));
              }
            });

            // Style each link based on whether both endpoints are in the path
            allLinks.forEach(link => {
              if (!link.graphic) return;
              
              const fromId = link.fromNode?.id;
              const toId = link.toNode?.id;
              
              // A link is in the path if BOTH its endpoints are in pathNodes
              const inPath = fromId && toId && pathNodes.has(fromId) && pathNodes.has(toId);

              // Disable Highcharts state management
              link.setState('');
              
              if (inPath) {
                // RED: This link connects two nodes in our highlighted path
                link.graphic.toFront();
                link.graphic.attr({
                  stroke: '#ff6b6b',
                  'stroke-width': 3,
                  opacity: 1,
                  zIndex: 100
                });
              } else {
                // GREY: This link is not part of the highlighted path
                link.graphic.attr({
                  stroke: '#666666',
                  'stroke-width': 1,
                  opacity: 0.1,
                  zIndex: 1
                });
              }
            });
          },
          mouseOut: function() {
            const series = this.series;
            if (!series || !series.points) return;
            
            // Reset Nodes
            series.points.forEach(p => {
              if (!p || !p.series) return; // Safety check
              try {
                p.setState('');
              } catch (e) {
                // Ignore setState errors for removed points
              }
              if (p.graphic) {
                  p.graphic.attr({ 
                    fill: '#ffffff',
                    fillColor: '#ffffff',
                    color: '#ffffff'
                  });
              }
              if (p.dataLabel) {
                  p.dataLabel.css({
                      color: '#ffffff',
                      opacity: 1,
                      textShadow: 'none',
                      textOutline: 'none',
                      fontWeight: '500'
                  });
                  // Reset background opacity
                  if (p.dataLabel.box) {
                      p.dataLabel.box.attr({ 
                        opacity: 1,
                        fill: '#1a1a1a',
                        stroke: 'none'
                      });
                  }
              }
            });
            
            // Reset Links
            const allLinks = new Set();
            series.points.forEach(p => {
                if (p.linksFrom) p.linksFrom.forEach(l => allLinks.add(l));
            });

            allLinks.forEach(link => {
              link.setState('');
              if (link.graphic) {
                link.graphic.attr({ 
                  stroke: '#555555',
                  'stroke-width': 1,
                  opacity: 0.5
                });
              }
            });
          }
        }
      },
      tooltip: {
        enabled: false // Disable popup
      },
      marker: {
        symbol: 'circle',
        radius: nodeRadius,
        fillColor: '#ffffff',
        lineWidth: 1,
        lineColor: '#666666'
      },
      dataLabels: {
        enabled: true,
        align: 'left',
        verticalAlign: 'middle',
        crop: false,
        overflow: 'allow',
        allowOverlap: true,
        backgroundColor: '#1a1a1a',
        borderRadius: 1,
        padding: 1,
        style: {
          color: '#ffffff',
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize}px`,
          fontWeight: '500',
          textOutline: 'none',
          whiteSpace: 'nowrap'
        },
        x: 8,
        y: -1,
        formatter: function() {
          return this.point.name;
        }
      },
      link: {
        color: '#555555', // Default grey
        lineWidth: 1,
        states: {
          hover: {
            enabled: false
          },
          inactive: {
            enabled: false
          }
        }
      },
      levels: levels
    }],
    tooltip: {
      enabled: false // Disable global tooltip
    }
  }), [levels, dynamicHeight, nodeRadius, fontSize, treeData, adjustedLevelDistance]);

  const handlePrevTree = () => {
    setCurrentTreeIndex(prev => prev > 0 ? prev - 1 : trees.length - 1);
    setForceUpdate(v => v + 1);
  };

  const handleNextTree = () => {
    setCurrentTreeIndex(prev => prev < trees.length - 1 ? prev + 1 : 0);
    setForceUpdate(v => v + 1);
  };

  // Show loading/empty state if no data
  if (!treeData || treeData.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        <p>No tree data available</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Navigation buttons */}
      {trees.length > 1 && (
        <div style={{
          position: 'absolute',
          top: '-52px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          background: 'transparent',
          padding: '0',
          borderRadius: '0',
          border: 'none'
        }}>
          <span style={{ color: '#888', fontSize: '12px', marginRight: '8px' }}>
            Tree {currentTreeIndex + 1} / {trees.length}
          </span>
          <button
            onClick={handlePrevTree}
            style={{
              background: '#2a2a2a',
              border: '1px solid #444',
              color: '#fff',
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}
          >
            ←
          </button>
          <button
            onClick={handleNextTree}
            style={{
              background: '#2a2a2a',
              border: '1px solid #444',
              color: '#fff',
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}
          >
            →
          </button>
        </div>
      )}

      <div ref={containerRef} style={{ 
        width: '100%', 
        height: '100%',
        overflow: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {forceUpdate >= 0 && (
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
            ref={chartRef}
            key={forceUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default CommentFlowTree;
