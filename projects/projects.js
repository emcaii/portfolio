import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';


const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const titleElement = document.querySelector('.projects-title');

if (titleElement && Array.isArray(projects)) {
  titleElement.textContent = `Projects (${projects.length})`;
}

const svg = d3.select('#projects-plot');

let data = [1, 2, 3, 4, 5, 5];
let sliceGen = d3.pie();
let arcData = sliceGen(data); 
let arcGen = d3.arc().innerRadius(0).outerRadius(50);

let colorScale = d3.scaleOrdinal(d3.schemeTableau10);

svg
  .selectAll('path')
  .data(arcData)
  .join('path')
  .attr('d', arcGen)
  .attr('fill', (d, i) => colorScale(i));