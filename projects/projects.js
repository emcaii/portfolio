import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const titleElement = document.querySelector('.projects-title');
if (titleElement && Array.isArray(projects)) {
  titleElement.textContent = `Projects (${projects.length})`;
}

let query = '';
const searchInput = document.querySelector('.searchBar');

let selectedIndex = -1;

function renderPieChart(projectsGiven) {

  const svg = d3.select('#projects-plot');
  svg.selectAll('path').remove();

  const legend = d3.select('.legend');
  legend.selectAll('*').remove();


  const rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  const data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));


  const sliceGen = d3.pie().value((d) => d.value);
  const arcData = sliceGen(data);
  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);


  svg
    .selectAll('path')
    .data(arcData)
    .join('path')
    .attr('d', arcGen)
    .attr('fill', (_, i) => colorScale(i))
    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
    .on('click', (_, i) => {

      selectedIndex = selectedIndex === i ? -1 : i;

      svg
        .selectAll('path')
        .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
      legend
        .selectAll('li')
        .attr('class', (_, idx) =>
          idx === selectedIndex ? 'legend-item selected' : 'legend-item'
        );

      if (selectedIndex === -1) {
        renderProjects(projectsGiven, projectsContainer, 'h2');
      } else {
        const year = data[selectedIndex].label;
        const filtered = projectsGiven.filter((p) => p.year === year);
        renderProjects(filtered, projectsContainer, 'h2');
      }
    });


  legend
    .selectAll('li')
    .data(data)
    .join('li')
    .attr('class', (_, i) =>
      i === selectedIndex ? 'legend-item selected' : 'legend-item'
    )
    .attr('style', (_, i) => `--color:${colorScale(i)}`)
    .html((d) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
    .on('click', (_, i) => {

      selectedIndex = selectedIndex === i ? -1 : i;
      svg
        .selectAll('path')
        .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
      legend
        .selectAll('li')
        .attr('class', (_, idx) =>
          idx === selectedIndex ? 'legend-item selected' : 'legend-item'
        );

      if (selectedIndex === -1) {
        renderProjects(projectsGiven, projectsContainer, 'h2');
      } else {
        const year = data[selectedIndex].label;
        const filtered = projectsGiven.filter((p) => p.year === year);
        renderProjects(filtered, projectsContainer, 'h2');
      }
    });
}

renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  const filteredProjects = projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});