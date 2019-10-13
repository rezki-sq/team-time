var gSheetURL = 'https://docs.google.com/spreadsheets/d/1gsEhI-Q5tgsypMbENcMhdueGblYCAxYc6A6eGo5vO1E/edit';
var gid = 924640030;
var queryString = '';
var queryURL = gSheetURL + '?gid=' + gid + queryString;

var colors = {
  'bg': '#FFF',
  'grayL': '#EEE',
  'gray': '#DDD',
}

var ganttChartOption = {
  width: 880,
  height: 1600,
  gantt: {
    defaultStartDate: new Date(),
    criticalPathEnabled: false,
    trackHeight: 48,
    barCornerRadius: 2,

    labelMaxWidth: 480,

    arrow: {
      angle: 100,
      width: 1,
      color: 'dodgerblue',
      radius: 0
    },
    labelStyle: {
      fontName: 'Roboto Mono',
      fontSize: 10,
      color: 'dodgerblue'
    },

    backgroundColor: {
      fill: colors.bg
    },
    innerGridTrack: {
      fill: colors.bg
    },
    innerGridDarkTrack: {
      fill: colors.bg
    },
    innerGridHorizLine: {
      stroke: colors.gray
    },
    shadowEnabled: false
  }
};

google.charts.load('current', {'packages':['corechart', 'gantt']});
google.charts.setOnLoadCallback(drawGID);

function daysToMilliseconds(days) {
  return days * 24 * 60 * 60 * 1000;
}

function drawGID() {
  var query = new google.visualization.Query(queryURL);
  query.send(handleQueryResponse);
}

function handleQueryResponse(response) {
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }

  var data = response.getDataTable();
  console.log('data ready', data);
  
  ganttChartOption.height = (data.wg.length + 1) * ganttChartOption.gantt.trackHeight;
  document.getElementById('chart_a').setAttribute('style', 'height:' + ganttChartOption.height + 'px;')
  
  window.dataDebug = data;

  drawGanttChart(data);
}

function handleChartReady() {
  console.log('chart ready');
  var translateOffset = 'translate(-100 0)';
  var elRoot = document.getElementById('chart_a_content');
  var elSvg = elRoot.querySelectorAll('svg');
  var elVLabel = elSvg[0].childNodes[8];
  var elBar1 = elSvg[0].childNodes[7];
  var elBar2 = elSvg[0].childNodes[6];
  var elTrack = elSvg[0].childNodes[2];
  var elBg = elSvg[0].childNodes[1].querySelectorAll('rect')[0];

  console.log(elTrack);

  // elVLabel.setAttribute('display', 'none');
  elVLabel.querySelectorAll('text').forEach(function(elText) { elText.setAttribute('display', 'none') });
  elBar1.setAttribute('transform', translateOffset);
  elBar2.setAttribute('transform', translateOffset);
  elTrack.querySelectorAll('text').forEach(function(elText) { elText.setAttribute('transform', translateOffset) });
  elBg.setAttribute('fill', 'rgba(0, 0, 0, 0)');

  dataDebug.wg.forEach(
    function(v, i) {
      if( v['c'][5]['v'] <= 0 ) {
        elTrack.querySelectorAll('rect')[i].setAttribute('fill', colors.grayL);
      }
    }
  );

  createFauxLabelH();
}

function createFauxLabelH() {
  var elFauxLabelContainer = document.getElementById('chart_a').querySelectorAll('.labelH')[0];
  dataDebug.wg.forEach(function(v, i) {
    var f = document.createElement('div');
    f.setAttribute('class', 'labelH-item bs');
    f.innerHTML = '<p>' + (i+1) + ' - ' + v['c'][1]['v'] + '</p>';
    elFauxLabelContainer.appendChild(f);
  });
  var e = document.createElement('div');
  e.setAttribute('class', 'labelH-item bs');
  e.innerHTML = '<p></p>';
  elFauxLabelContainer.appendChild(e);
}

function drawGanttChart(data) {
  var chart = new google.visualization.Gantt(document.getElementById('chart_a_content'));
  google.visualization.events.addListener(chart, 'ready', handleChartReady);
  chart.draw(data, ganttChartOption);
}