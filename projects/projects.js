import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const titleElement = document.querySelector('.projects-title');
if (titleElement && Array.isArray(projects)) {
  titleElement.textContent = `Projects (${projects.length})`;
}

const rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year
);

const projdata = rolledData.map(([year, count]) => ({
  value: count,
  label: year
}));

const svg = d3.select('#projects-plot');

const sliceGen = d3.pie().value((d) => d.value);
const arcData = sliceGen(projdata);
const arcGen = d3.arc().innerRadius(0).outerRadius(50);

const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

svg
  .selectAll('path')
  .data(arcData)
  .join('path')
  .attr('d', arcGen)
  .attr('fill', (d, i) => colorScale(i));

const legend = d3.select('.legend');
legend
  .selectAll('li')
  .data(projdata)
  .join('li')
  .attr('class', 'legend-item')
  .attr('style', (d, i) => `--color:${colorScale(i)}`)
  .html((d) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
