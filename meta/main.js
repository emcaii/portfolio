import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
    const first = lines[0];
    const { author, date, time, timezone, datetime } = first;
    const commitObj = {
      id: commit,
      url: 'https://github.com/YOUR_REPO/commit/' + commit,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
    };

    // Add the full line data as a hidden property
    Object.defineProperty(commitObj, 'lines', {
      value: lines,
      enumerable: false,  // hidden from console display
      writable: false,
      configurable: true,
    });

    return commitObj;
  });
}

let data = await loadData();
let commits = processCommits(data);

console.log(commits);

function renderCommitInfo(data, commits) {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Number of distinct files
  dl.append('dt').text('Files in codebase');
  dl.append('dd').text(d3.group(data, d => d.file).size);

  // Average line length
  dl.append('dt').text('Average line length (chars)');
  dl.append('dd').text(d3.mean(data, d => d.length).toFixed(1));

  // Maximum depth
  dl.append('dt').text('Maximum depth');
  dl.append('dd').text(d3.max(data, d => d.depth));
}

renderCommitInfo(data, commits);