import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DataPoint } from '../types/selfMap';

interface SelfMapVisualizationProps {
  data: DataPoint[];
}

export const SelfMapVisualization: React.FC<SelfMapVisualizationProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 120, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([-5, 5])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([-5, 5])
      .range([height, 0]);

    // Create grid
    const xGrid = d3.axisBottom(xScale)
      .tickSize(-height)
      .tickFormat(() => '');

    const yGrid = d3.axisLeft(yScale)
      .tickSize(-width)
      .tickFormat(() => '');

    // Add grid lines with styling
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(xGrid)
      .style('stroke-opacity', 0.1);

    svg.append('g')
      .attr('class', 'grid')
      .call(yGrid)
      .style('stroke-opacity', 0.1);

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .style('font-size', '12px');

    svg.append('g')
      .call(yAxis)
      .style('font-size', '12px');

    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('X Axis');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Y Axis');

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Self Map Visualization');

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'absolute hidden bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    // Calculate position based on value (10 = center, 1 = edge)
    const calculatePosition = (value: number) => {
      // Normalize value to 0-1 range (inverted so 10 is at center)
      const normalizedValue = (10 - value) / 9; // Now 10 -> 0, 1 -> 1
      
      // Calculate distance from center (0 to 5 units, matching our scale)
      const distanceFromCenter = normalizedValue * 5;
      
      // Random angle in radians
      const angle = Math.random() * 2 * Math.PI;
      
      return {
        x: Math.cos(angle) * distanceFromCenter,
        y: Math.sin(angle) * distanceFromCenter
      };
    };

    // Plot points
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => {
        const pos = calculatePosition(d.value);
        return xScale(pos.x);
      })
      .attr('cy', d => {
        const pos = calculatePosition(d.value);
        return yScale(pos.y);
      })
      .attr('r', 8)
      .attr('fill', d => colorScale(d.category))
      .attr('fill-opacity', 0.7)
      .attr('stroke', d => d3.color(colorScale(d.category))?.darker().toString() || '')
      .attr('stroke-width', 1.5)
      .attr('class', 'transition-all duration-200')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .attr('r', 10)
          .attr('fill-opacity', 1);

        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .html(`
            <div class="font-semibold">${d.label}</div>
            <div class="text-sm text-gray-600">Category: ${d.category}</div>
            <div class="text-sm text-gray-600">Value: ${d.value}/10</div>
            ${d.details ? `<div class="text-sm text-gray-600 mt-2 max-h-32 overflow-y-auto">${JSON.stringify(d.details, null, 2)}</div>` : ''}
          `)
          .classed('hidden', false);
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .attr('r', 8)
          .attr('fill-opacity', 0.7);
        tooltip.classed('hidden', true);
      });

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 20}, 0)`);

    const categories = Array.from(new Set(data.map(d => d.category)));
    
    const legendItems = legend.selectAll('.legend-item')
      .data(categories)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => `translate(0, ${i * 25})`);

    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('rx', 2)
      .attr('fill', d => colorScale(d))
      .attr('fill-opacity', 0.7)
      .attr('stroke', d => d3.color(colorScale(d))?.darker().toString() || '');

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .text(d => d)
      .style('font-size', '12px')
      .style('fill', '#4b5563');

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [data]);

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="mx-auto" />
    </div>
  );
};